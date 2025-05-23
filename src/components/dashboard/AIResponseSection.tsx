
import React, { useRef, useEffect, useState, ChangeEvent } from 'react';
import { Loader2, Search, X, FileDown } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import NeuButton from '@/components/NeuButton';
import NeuCard from '@/components/NeuCard';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { formatIndianNumber, formatSearchResultsToCsv, downloadCsv } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AIResponseSectionProps {
  searchBrief: string;
  searchResults: any;
  searchLoading: boolean;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSearchBriefChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onClear: () => void;
}

const loaderMessages = ["Fetching platforms…", "Fetching assets…", "Understanding…", "Brief…", "Creating plan…"];

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
  const [displayMode, setDisplayMode] = useState<'formatted' | 'raw'>('formatted');
  const { toast } = useToast();
  
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

  const formatJsonDisplay = (data: any): string => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("Error formatting JSON:", error);
      return JSON.stringify({ error: "Failed to format JSON response" });
    }
  };

  // Calculate the correct estimated clicks or impressions based on buyType and budget
  const calculateEstimates = (asset: any) => {
    const budgetAmount = parseFloat(asset.budgetAmount);
    const baseCost = parseFloat(asset.baseCost);
    
    if (isNaN(budgetAmount) || isNaN(baseCost) || baseCost === 0) {
      return { estimatedClicks: "N/A", estimatedImpressions: "N/A" };
    }
    
    const buyType = asset.buyType?.toLowerCase() || "";
    
    if (buyType.includes("click")) {
      // Cost Per Click (CPC) - calculate clicks directly
      const clicks = Math.round(budgetAmount / baseCost);
      return { 
        estimatedClicks: formatIndianNumber(clicks), 
        estimatedImpressions: "N/A" 
      };
    } else if (buyType.includes("mille")) {
      // Cost Per Mille (CPM) - calculate impressions then derive clicks
      const impressions = Math.round((budgetAmount / baseCost) * 1000);
      return { 
        estimatedClicks: "N/A", 
        estimatedImpressions: formatIndianNumber(impressions) 
      };
    }
    
    // Default if buyType is not recognized
    return { 
      estimatedClicks: asset.estimatedClicks || "N/A", 
      estimatedImpressions: asset.estimatedImpressions || "N/A" 
    };
  };

  const handleExport = () => {
    if (!searchResults) {
      toast({
        title: "Nothing to export",
        description: "Generate a media plan first before exporting",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const csvContent = formatSearchResultsToCsv(searchResults);
      const fileName = `media-plan-${new Date().toISOString().slice(0, 10)}.csv`;
      downloadCsv(csvContent, fileName);
      
      toast({
        title: "Export successful",
        description: `Media plan exported as ${fileName}`,
        variant: "default"
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "Could not export the media plan",
        variant: "destructive"
      });
    }
  };

  const renderFormattedResponse = (data: any) => {
    if (!data || !data.choices || !data.choices[0]?.message?.content) {
      return <p>No valid data available to format.</p>;
    }

    const content = data.choices[0].message.content;
    
    return (
      <div className="space-y-8">
        {/* Brief Summary */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Brief Summary</h2>
          <p>{content.briefSummary}</p>
        </div>

        {/* Plans */}
        {content.options && Object.entries(content.options).map(([key, option]: [string, any], index) => {
          // Process assets and update estimations
          const processedAssets = option.assets?.map((asset: any) => {
            const estimates = calculateEstimates(asset);
            return {
              ...asset,
              estimatedClicks: estimates.estimatedClicks,
              estimatedImpressions: estimates.estimatedImpressions
            };
          }) || [];

          return (
            <div key={key} className="pb-6">
              <h2 className="text-xl font-bold mb-4">{index + 1}. {option.planName}</h2>
              <div className="mb-4">
                <p><strong>Total Budget:</strong> ₹{formatIndianNumber(option.totalBudget)}</p>
                <p><strong>Budget Percentage:</strong> {option.budgetPercentage}</p>
              </div>
              
              {processedAssets.length > 0 && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bold">Asset Name</TableHead>
                        <TableHead className="font-bold">Platform</TableHead>
                        <TableHead className="font-bold">Industry</TableHead>
                        <TableHead className="font-bold">Buy Type</TableHead>
                        <TableHead className="font-bold">Base Cost</TableHead>
                        <TableHead className="font-bold">Estimated Clicks</TableHead>
                        <TableHead className="font-bold">Estimated Impressions</TableHead>
                        <TableHead className="font-bold">Budget Percent</TableHead>
                        <TableHead className="font-bold">Budget Amount</TableHead>
                        <TableHead className="font-bold">Targeting</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedAssets.map((asset: any) => (
                        <TableRow key={asset.assetId}>
                          <TableCell className="font-medium">{asset.assetName}</TableCell>
                          <TableCell>{asset.platform}</TableCell>
                          <TableCell>{asset.industry}</TableCell>
                          <TableCell>{asset.buyType}</TableCell>
                          <TableCell>₹{asset.baseCost}</TableCell>
                          <TableCell>{asset.estimatedClicks}</TableCell>
                          <TableCell>{asset.estimatedImpressions}</TableCell>
                          <TableCell>{asset.budgetPercent}%</TableCell>
                          <TableCell>₹{formatIndianNumber(asset.budgetAmount)}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="text-xs">
                              <p><strong>Geographic:</strong> {asset.targeting.geographic}</p>
                              <p><strong>Device:</strong> {asset.targeting.deviceSplit}</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          );
        })}

        {/* Recommendation */}
        {content.recommendation && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Recommendation</h2>
            <p>{content.recommendation}</p>
          </div>
        )}

        {/* Next Steps */}
        {content.nextSteps && content.nextSteps.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Next Steps</h2>
            <ul className="list-disc pl-5">
              {content.nextSteps.map((step: string, index: number) => (
                <li key={index}>{step}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <form onSubmit={onSearchSubmit} className="flex gap-2 mb-4">
        <div className="relative flex-grow">
          <Textarea 
            placeholder="Enter your detailed brief with the client name" 
            value={searchBrief} 
            onChange={onSearchBriefChange} 
            style={{
              lineHeight: '24px'
            }} 
            className="pr-10 min-h-[100px] max-h-[250px] overflow-y-auto resize-none" 
          />
          {searchBrief && (
            <button 
              type="button" 
              onClick={onClear} 
              className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
              aria-label="Clear input"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <NeuButton type="submit" disabled={searchLoading} className="self-start">
          {searchLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Generate Media Plan
        </NeuButton>
      </form>

      {searchLoading ? (
        <div className="flex flex-col justify-center items-center py-10 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-muted-foreground animate-fade-in">
            {loaderMessages[loaderMessageIdx]}
          </span>
        </div>
      ) : searchResults ? (
        <NeuCard>
          <div className="p-4">
            <div className="flex justify-between mb-4">
              <div className="inline-flex rounded-md shadow-sm">
                <button
                  type="button"
                  onClick={() => setDisplayMode('formatted')}
                  className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                    displayMode === 'formatted' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  Formatted
                </button>
                <button
                  type="button"
                  onClick={() => setDisplayMode('raw')}
                  className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                    displayMode === 'raw' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  Raw JSON
                </button>
              </div>
              
              <NeuButton 
                onClick={handleExport} 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
              >
                <FileDown className="h-4 w-4" />
                Export CSV
              </NeuButton>
            </div>

            {displayMode === 'formatted' ? (
              renderFormattedResponse(searchResults)
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-4">Raw Response Data</h2>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto text-sm">
                  <code>{formatJsonDisplay(searchResults)}</code>
                </pre>
              </div>
            )}
          </div>
        </NeuCard>
      ) : null}
    </div>
  );
};

export default AIResponseSection;

