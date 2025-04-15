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
  ORDER BY
    similarity DESC, a.name
  LIMIT match_count;
END;
$$;