
import React from "react";
import { Bot, Search } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import NeuCard from "@/components/NeuCard";
import NeuButton from "@/components/NeuButton";
import NeuInput from "@/components/NeuInput";

interface AIResponseSectionProps {
  searchBrief: string;
  searchResults: any;
  searchLoading: boolean;
  onSearchSubmit: (e: React.FormEvent) => Promise<void>;
  onSearchBriefChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onClear: () => void;
}

const AIResponseSection: React.FC<AIResponseSectionProps> = ({
  searchBrief,
  searchResults,
  searchLoading,
  onSearchSubmit,
  onSearchBriefChange,
  onClear,
}) => {
  return (
    <NeuCard className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Bot className="text-primary" size={24} />
        <h2 className="text-xl font-bold">AI Response</h2>
      </div>
      <p className="text-muted-foreground mb-4">
        Enter your query and get an AI-powered response.
      </p>
      
      <form onSubmit={onSearchSubmit} className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <NeuInput
              as="textarea"
              placeholder="Enter your query..."
              value={searchBrief}
              onChange={onSearchBriefChange}
              className="w-full"
              rows={3}
            />
          </div>
          <div className="flex items-end">
            <NeuButton 
              type="submit" 
              disabled={searchLoading}
              className="whitespace-nowrap"
            >
              {searchLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Search size={16} />
                  Get Response
                </span>
              )}
            </NeuButton>
          </div>
        </div>
      </form>

      {searchResults && (
        <div className="space-y-4">
          <div className="prose prose-sm max-w-none bg-neugray-100 p-6 rounded-lg">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              className="whitespace-pre-wrap [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              components={{
                p: ({node, ...props}) => <p {...props} className="mb-2 last:mb-0" />,
                ul: ({node, ...props}) => <ul {...props} className="list-disc list-inside" />,
                ol: ({node, ...props}) => <ol {...props} className="list-decimal list-inside" />,
                code: ({node, ...props}) => <code {...props} className="bg-neugray-200 px-1 py-0.5 rounded text-sm" />,
              }}
            >
              {searchResults.choices && searchResults.choices[0]?.message?.content || 
               "No response content available"}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {searchBrief.trim() && !searchResults && !searchLoading && (
        <div className="text-center py-8">
          <div className="text-muted-foreground mb-4">
            <Search size={48} className="mx-auto mb-2 opacity-40" />
            <p>No response found for your query.</p>
          </div>
          <NeuButton variant="outline" onClick={onClear}>
            Clear query and try again
          </NeuButton>
        </div>
      )}
    </NeuCard>
  );
};

export default AIResponseSection;
