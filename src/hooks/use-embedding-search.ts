
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
        body: { query }
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

  return {
    searchByEmbedding,
    loading,
  };
};
