
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
      // Instead of embedding search, we call our new function
      const { data: searchResults, error: searchError } = await supabase.functions.invoke('generate-media-plan', {
        body: { 
          prompt: searchBrief,
          includeAllAssets: true,
          includeAllPlatforms: true
        }
      });

      if (searchError) throw searchError;
      
      setResults(searchResults.results || []);
      return searchResults.results || [];
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
