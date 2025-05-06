
-- Create an IMMUTABLE function for text vector generation
CREATE OR REPLACE FUNCTION public.immutable_tsvector_concat(name text, description text, category text, tags text[])
RETURNS tsvector
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT 
    to_tsvector('english', 
      coalesce(name, '') || ' ' || 
      coalesce(description, '') || ' ' || 
      coalesce(category, '') || ' ' || 
      coalesce(array_to_string(tags, ' '), '')
    )
$$;

-- Updated PostgreSQL function for hybrid vector + full-text similarity search
CREATE OR REPLACE FUNCTION match_assets_by_embedding_only(
  query_embedding vector(1536),       -- Vector embedding of the query text
  query_text text,                    -- Original query text for full-text search
  match_threshold float,              -- Similarity threshold (0.0 to 1.0)
  match_count int                     -- Maximum number of records to return
)
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  description text,
  thumbnail_url text,
  file_url text,
  type text,
  tags text[],
  buy_types text,
  amount integer,                     -- Changed from numeric to integer
  platform_id uuid,
  platform_name text,
  platform_industry text,
  platform_description text,          -- Added platform description field
  platform_audience_data jsonb,
  platform_campaign_data jsonb,
  platform_device_split jsonb,
  platform_mau text,
  platform_dau text,
  platform_premium_users smallint,
  platform_restrictions jsonb,
  placement text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.name,
    a.category,
    a.description,
    a.thumbnail_url,
    a.file_url,
    a.type,
    a.tags,
    a.buy_types,
    a.amount::integer,               -- Cast existing amount to integer
    a.platform_id,
    p.name AS platform_name,
    p.industry AS platform_industry,
    p.description AS platform_description,  -- Added platform description field
    p.audience_data AS platform_audience_data,
    p.campaign_data AS platform_campaign_data,
    p.device_split AS platform_device_split,
    p.mau AS platform_mau,
    p.dau AS platform_dau,
    p.premium_users AS platform_premium_users,
    p.restrictions AS platform_restrictions,
    a.placement,
    (
      0.7 * (1 - (a.embedding <=> query_embedding)) + 
      0.3 * ts_rank(
        public.immutable_tsvector_concat(a.name, a.description, a.category, a.tags), 
        plainto_tsquery('english', query_text)
      )
    ) AS similarity
  FROM
    assets a
  LEFT JOIN
    platforms p ON a.platform_id = p.id
  WHERE
    a.embedding IS NOT NULL
    AND (1 - (a.embedding <=> query_embedding)) > match_threshold
  ORDER BY
    similarity DESC
  LIMIT match_count;
END;
$$;

-- Create a GIN index on the full-text search fields to improve performance
CREATE INDEX IF NOT EXISTS idx_assets_fulltext 
ON assets USING GIN (public.immutable_tsvector_concat(name, description, category, tags));

