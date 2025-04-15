
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
  tags: string[] | null;
  platform_id: string | null;
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
      // Call the updated function that accepts a text query
      const { data, error } = await supabase.rpc('match_assets', {
        query_text: searchBrief,
        match_threshold: 0.5,
        match_count: 10
      });

      if (error) throw error;
      
      setResults(data || []);
      return data || [];
    } catch (err: any) {
      console.error("Error in embedding search:", err);
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
