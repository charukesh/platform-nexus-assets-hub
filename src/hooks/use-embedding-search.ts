import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SearchResult {
  id: string;
  name: string;
  category: string;
  description: string | null;
  thumbnail_url: string | null;
  file_url: string | null;
  type: string;
  tags: string[] | null;
  platform_id: string | null;
  platform_name: string | null;
  platform_industry: string | null;
  similarity: number;
}

export function useEmbeddingSearch() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const searchByEmbedding = async (searchBrief: string) => {
    if (!searchBrief.trim()) {
      setError("Search query is required");
      toast({
        title: "Error",
        description: "Please enter a search brief",
        variant: "destructive"
      });
      return [];
    }

    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Calling generate-media-plan function with brief:', searchBrief);
      
      const { data: searchResults, error: searchError } = await supabase.functions.invoke('generate-media-plan', {
        body: { 
          prompt: searchBrief,
        }
      });

      if (searchError) {
        console.error('Search error details:', searchError);
        throw searchError;
      }
      
      if (!searchResults) {
        throw new Error('No results returned from search function');
      }

      console.log('Search function returned results:', searchResults);
      
      // If there are results, process them
      if (searchResults.assets && Array.isArray(searchResults.assets)) {
        setResults(searchResults.assets.map(asset => ({
          ...asset,
          platform_name: asset.platform?.name || null,
          platform_industry: asset.platform?.industry || null,
          similarity: 1 // Default similarity since we're not using embeddings
        })));
        return searchResults.assets;
      } else {
        console.log('No assets property in search results');
        setResults([]);
        return [];
      }
    } catch (err: any) {
      console.error("Error in search:", err);
      setError(err.message || "An error occurred during search");
      toast({
        title: "Search error",
        description: err.message || "Failed to search assets",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    results,
    isLoading,
    error,
    searchByEmbedding
  };
}
