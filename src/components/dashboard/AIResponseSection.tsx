
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import NeuButton from '@/components/NeuButton';
import NeuCard from '@/components/NeuCard';

interface AIResponseSectionProps {
  searchBrief: string;
  searchResults: any;
  searchLoading: boolean;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSearchBriefChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

const AIResponseSection: React.FC<AIResponseSectionProps> = ({
  searchBrief,
  searchResults,
  searchLoading,
  onSearchSubmit,
  onSearchBriefChange,
  onClear
}) => {
  const [streamedContent, setStreamedContent] = useState<string>('');

  useEffect(() => {
    if (searchResults instanceof ReadableStream) {
      // Reset content when new stream arrives
      setStreamedContent('');
      
      const reader = searchResults.getReader();
      const decoder = new TextDecoder();

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            console.log("Raw chunk:", chunk);
            
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const jsonStr = line.slice(6);
                  console.log("JSON string:", jsonStr);
                  
                  const data = JSON.parse(jsonStr);
                  console.log("Parsed data:", data);
                  
                  if (data.content) {
                    setStreamedContent(prev => prev + data.content);
                  }
                } catch (e) {
                  console.error('Error parsing SSE data:', e);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error reading stream:', error);
        } finally {
          reader.releaseLock();
        }
      };

      processStream();
    } else if (searchResults) {
      // Handle non-streaming response (fallback)
      const content = searchResults.choices?.[0]?.message?.content || '';
      setStreamedContent(content);
    }
  }, [searchResults]);

  const renderAIResponse = () => {
    if (!searchResults) return null;

    return (
      <div className="mt-4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          className="prose prose-sm max-w-full"
        >
          {streamedContent.trim() || "Waiting for response..."}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div>
      <form onSubmit={onSearchSubmit} className="flex gap-2 mb-4">
        <div className="relative flex-grow">
          <Input
            placeholder="Describe the assets you're looking for..."
            value={searchBrief}
            onChange={onSearchBriefChange}
            className="pr-10"
          />
          {searchBrief && (
            <button 
              type="button" 
              onClick={onClear} 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-destructive"
            >
              ✕
            </button>
          )}
        </div>
        <NeuButton type="submit" disabled={searchLoading}>
          {searchLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Search className="mr-2 h-4 w-4" />
          )}
          Search
        </NeuButton>
      </form>

      {searchLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : searchResults ? (
        <NeuCard>
          {renderAIResponse()}
        </NeuCard>
      ) : null}
    </div>
  );
};

export default AIResponseSection;
