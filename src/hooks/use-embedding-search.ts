
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export const useEmbeddingSearch = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchByEmbedding = async (query: string) => {
    if (!query.trim()) {
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-embedding-search', {
        body: { 
          query,
          // Send the original query text for potential full-text search
          text: query
        }
      });

      if (error) throw error;

      return data || null;
    } catch (err: any) {
      console.error('Error searching by embedding:', err);
      toast({
        title: 'Search error',
        description: err.message || 'Failed to perform embedding search',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const regenerateAllEmbeddings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('regenerate-embeddings');
      
      if (error) throw error;

      toast({
        title: 'Success',
        description: `Successfully regenerated embeddings for ${data.processed} assets`,
      });

      return data;
    } catch (err: any) {
      console.error('Error regenerating embeddings:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to regenerate embeddings',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    searchByEmbedding,
    regenerateAllEmbeddings,
    loading,
  };
};
