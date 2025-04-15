
-- Create a function to perform vector similarity search on assets
CREATE OR REPLACE FUNCTION match_assets(
  query_embedding vector(1536),  -- The embedding vector to compare against
  match_threshold float,         -- Similarity threshold (0.0 to 1.0)
  match_count int                -- Maximum number of records to return
)
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  description text,
  thumbnail_url text,
  file_url text,
  tags text[],
  platform_id uuid,
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
    a.tags,
    a.platform_id,
    1 - (a.embedding <=> query_embedding) AS similarity
  FROM
    assets a
  WHERE
    a.embedding IS NOT NULL
  ORDER BY
    a.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
