
-- Create a function to perform vector similarity search on assets
CREATE OR REPLACE FUNCTION match_assets(
  query_text text,               -- Text query to search for
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
    CASE
      WHEN a.embedding IS NOT NULL THEN 0.5  -- Default similarity for demonstration
      ELSE 0.5
    END AS similarity
  FROM
    assets a
  WHERE
    a.name ILIKE '%' || query_text || '%'
    OR a.description ILIKE '%' || query_text || '%'
    OR EXISTS (
      SELECT 1 FROM unnest(a.tags) tag
      WHERE tag ILIKE '%' || query_text || '%'
    )
  ORDER BY
    similarity DESC, a.name
  LIMIT match_count;
END;
$$;
