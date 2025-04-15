-- PostgreSQL function using vector similarity
CREATE OR REPLACE FUNCTION match_assets_by_embedding(
  query_embedding vector(1536),       -- Vector embedding of the query text
  match_threshold float,              -- Similarity threshold (0.0 to 1.0)
  match_count int,                    -- Maximum number of records to return
  filter_category text DEFAULT NULL,  -- Optional category filter
  filter_platform_id uuid DEFAULT NULL -- Optional platform filter
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
  platform_id uuid,
  platform_name text,
  platform_industry text,
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
    a.platform_id,
    p.name AS platform_name,
    p.industry AS platform_industry,
    1 - (a.embedding <=> query_embedding) AS similarity
  FROM
    assets a
  LEFT JOIN
    platforms p ON a.platform_id = p.id
  WHERE
    a.embedding IS NOT NULL
    AND (1 - (a.embedding <=> query_embedding)) > match_threshold
    AND (filter_category IS NULL OR a.category = filter_category)
    AND (filter_platform_id IS NULL OR a.platform_id = filter_platform_id)
  ORDER BY
    similarity DESC, a.name
  LIMIT match_count;
END;
$$;

-- Function for text-based search when no embedding is available
CREATE OR REPLACE FUNCTION match_assets_by_text(
  query_text text,                    -- Text query to search for
  match_count int,                    -- Maximum number of records to return
  filter_category text DEFAULT NULL,  -- Optional category filter
  filter_platform_id uuid DEFAULT NULL -- Optional platform filter
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
  platform_id uuid,
  platform_name text,
  platform_industry text,
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
    a.platform_id,
    p.name AS platform_name,
    p.industry AS platform_industry,
    CASE
      WHEN a.name ILIKE '%' || query_text || '%' THEN 0.9
      WHEN a.description ILIKE '%' || query_text || '%' THEN 0.7
      WHEN EXISTS (
        SELECT 1 FROM unnest(a.tags) tag
        WHERE tag ILIKE '%' || query_text || '%'
      ) THEN 0.6
      ELSE 0.5
    END AS similarity
  FROM
    assets a
  LEFT JOIN
    platforms p ON a.platform_id = p.id
  WHERE
    (a.name ILIKE '%' || query_text || '%'
    OR a.description ILIKE '%' || query_text || '%'
    OR EXISTS (
      SELECT 1 FROM unnest(a.tags) tag
      WHERE tag ILIKE '%' || query_text || '%'
    ))
    AND (filter_category IS NULL OR a.category = filter_category)
    AND (filter_platform_id IS NULL OR a.platform_id = filter_platform_id)
  ORDER BY
    similarity DESC, a.name
  LIMIT match_count;
END;
$$;