
import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Loader2, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import NeuButton from '@/components/NeuButton';
import NeuCard from '@/components/NeuCard';
import * as emoji from 'node-emoji';

interface AIResponseSectionProps {
  searchBrief: string;
  searchResults: any;
  searchLoading: boolean;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSearchBriefChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

const loaderMessages = [
  "Fetching platforms…",
  "Fetching assets…",
  "Understanding…",
  "Brief…",
  "Creating plan…"
];

const AIResponseSection: React.FC<AIResponseSectionProps> = ({
  searchBrief,
  searchResults,
  searchLoading,
  onSearchSubmit,
  onSearchBriefChange,
  onClear
}) => {
  const [loaderMessageIdx, setLoaderMessageIdx] = useState(0);
  const loaderIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (searchLoading) {
      setLoaderMessageIdx(0);
      loaderIntervalRef.current = window.setInterval(() => {
        setLoaderMessageIdx(idx => (idx + 1) % loaderMessages.length);
      }, 1200);
    } else {
      if (loaderIntervalRef.current) {
        clearInterval(loaderIntervalRef.current);
        loaderIntervalRef.current = null;
      }
    }
    return () => {
      if (loaderIntervalRef.current) {
        clearInterval(loaderIntervalRef.current);
        loaderIntervalRef.current = null;
      }
    };
  }, [searchLoading]);

  const renderAIResponse = () => {
    if (!searchResults) return null;
    const content = searchResults.choices?.[0]?.message?.content || '';
    // Emojify markdown content (convert :shortcode: to emoji)
    const emojifiedContent = emoji.emojify(content);
    return (
      <div className="mt-4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          className="prose prose-sm max-w-full dark:prose-invert"
        >
          {emojifiedContent || "No content received"}
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
        <div className="flex flex-col justify-center items-center py-10 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-muted-foreground animate-fade-in">{loaderMessages[loaderMessageIdx]}</span>
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
