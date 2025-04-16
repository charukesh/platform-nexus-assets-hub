
-- Corrected PostgreSQL function for vector similarity search
CREATE OR REPLACE FUNCTION match_assets_by_embedding_only(
  query_embedding vector(1536),       -- Vector embedding of the query text
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
  amount numeric,
  estimated_clicks integer,
  estimated_impressions integer,
  platform_id uuid,
  platform_name text,
  platform_industry text,
  platform_audience_data jsonb,
  platform_campaign_data jsonb,
  platform_device_split jsonb,
  platform_mau text,
  platform_dau text,
  platform_premium_users smallint,
  platform_restrictions jsonb,
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
    a.amount,
    a.estimated_clicks,
    a.estimated_impressions,
    a.platform_id,
    p.name AS platform_name,
    p.industry AS platform_industry,
    p.audience_data AS platform_audience_data,
    p.campaign_data AS platform_campaign_data,
    p.device_split AS platform_device_split,
    p.mau AS platform_mau,
    p.dau AS platform_dau,
    p.premium_users AS platform_premium_users,
    p.restrictions AS platform_restrictions,
    1 - (a.embedding <=> query_embedding) AS similarity
  FROM
    assets a
  LEFT JOIN
    platforms p ON a.platform_id = p.id
  WHERE
    a.embedding IS NOT NULL
    AND (1 - (a.embedding <=> query_embedding)) > match_threshold
  ORDER BY
    similarity DESC, a.name
  LIMIT match_count;
END;
$$;
