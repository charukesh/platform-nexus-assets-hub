import React, { useRef, useEffect, useState, ChangeEvent } from 'react';
import { Loader2, Search, X, Edit, Check, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import NeuButton from '@/components/NeuButton';
import NeuCard from '@/components/NeuCard';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
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
  const [editingCell, setEditingCell] = useState<{
    optionKey: string;
    rowIndex: number;
    originalValue: number;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [processedResults, setProcessedResults] = useState<any>(null);
  
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

  useEffect(() => {
    if (searchResults) {
      // Create a deep copy of the results to avoid modifying the original data
      setProcessedResults(JSON.parse(JSON.stringify(searchResults)));
    } else {
      setProcessedResults(null);
    }
  }, [searchResults]);

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
    const ctr = 16; // Adding default CTR of 16
    
    if (isNaN(budgetAmount) || isNaN(baseCost) || baseCost === 0) {
      return { estimatedClicks: "N/A", estimatedImpressions: "N/A", ctr };
    }
    
    const buyType = asset.buyType?.toLowerCase() || "";
    
    if (buyType.includes("click")) {
      // Cost Per Click (CPC) - calculate clicks directly
      const clicks = Math.round(budgetAmount / baseCost);
      // Use CTR to calculate impressions if possible
      const impressions = Math.round(clicks * 100 / ctr);
      return { 
        estimatedClicks: formatIndianNumber(clicks), 
        estimatedImpressions: formatIndianNumber(impressions),
        ctr 
      };
    } else if (buyType.includes("mille")) {
      // Cost Per Mille (CPM) - calculate impressions then derive clicks
      const impressions = Math.round((budgetAmount / baseCost) * 1000);
      // Use CTR to calculate clicks
      const clicks = Math.round(impressions * ctr / 100);
      return { 
        estimatedClicks: formatIndianNumber(clicks), 
        estimatedImpressions: formatIndianNumber(impressions),
        ctr
      };
    }
    
    // Default if buyType is not recognized
    return { 
      estimatedClicks: asset.estimatedClicks || "N/A", 
      estimatedImpressions: asset.estimatedImpressions || "N/A",
      ctr 
    };
  };

  const handleEditBudget = (optionKey: string, rowIndex: number, currentValue: number) => {
    setEditingCell({ optionKey, rowIndex, originalValue: currentValue });
    setEditValue(currentValue.toString());
  };

  const handleSaveEdit = () => {
    if (!editingCell || !processedResults) return;
    
    try {
      const { optionKey, rowIndex } = editingCell;
      const newBudget = parseFloat(editValue);
      
      if (isNaN(newBudget) || newBudget <= 0) {
        toast({
          title: "Invalid amount",
          description: "Please enter a valid budget amount",
          variant: "destructive"
        });
        return;
      }
      
      const content = processedResults.choices[0].message.content;
      const asset = content.options[optionKey].assets[rowIndex];
      const oldBudget = parseFloat(asset.budgetAmount);
      const budgetDiff = newBudget - oldBudget;
      
      // Update the budget amount for this asset
      asset.budgetAmount = newBudget;
      
      // Recalculate estimations based on the new budget
      const estimates = calculateEstimates(asset);
      asset.estimatedClicks = estimates.estimatedClicks;
      asset.estimatedImpressions = estimates.estimatedImpressions;
      
      // Update the total budget for the option
      content.options[optionKey].totalBudget = parseFloat(content.options[optionKey].totalBudget) + budgetDiff;
      
      // Reset editing state
      setEditingCell(null);
      
      // Force a refresh of the UI
      setProcessedResults({...processedResults});
      
    } catch (error) {
      console.error("Error updating budget:", error);
      toast({
        title: "Update failed",
        description: "An error occurred while updating the budget",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  const handleExportCsv = () => {
    if (!processedResults) return;
    
    try {
      // Format the results to CSV
      const csvContent = formatSearchResultsToCsv(processedResults);
      
      // Generate a timestamp for the filename
      const now = new Date();
      const timestamp = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
      
      // Download the CSV file
      downloadCsv(csvContent, `media_plan_${timestamp}.csv`);
      
      toast({
        title: "Export successful",
        description: "Media plan has been exported to CSV",
        variant: "default"
      });
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast({
        title: "Export failed",
        description: "Failed to export media plan to CSV",
        variant: "destructive"
      });
    }
  };

  const handleExportToGoogleSheets = () => {
    if (!processedResults) return;
    
    try {
      // Get the data from the processed results
      const content = processedResults.choices[0].message.content;
      if (!content) {
        throw new Error("No content found in results");
      }
      
      // Create a clean CSV structure
      let csvContent = 'data:text/csv;charset=utf-8,';
      
      // Add brief summary
      csvContent += 'Brief Summary\n';
      csvContent += `${content.briefSummary || ''}\n\n`;
      
      // Process each plan option
      if (content.options) {
        Object.entries(content.options).forEach(([key, option]: [string, any]) => {
          csvContent += `Plan: ${option.planName}\n`;
          csvContent += `Total Budget: ₹${option.totalBudget}\n\n`;
          
          // Add table headers for assets
          csvContent += 'Asset Name,Platform,Industry,Buy Type,Base Cost,Estimated Clicks,Estimated Impressions,CTR (%),Budget Percent,Budget Amount,Geographic Targeting,Device Targeting\n';
          
          // Add asset rows
          if (option.assets && option.assets.length > 0) {
            option.assets.forEach((asset: any) => {
              const row = [
                asset.assetName || '',
                asset.platform || '',
                asset.industry || '',
                asset.buyType || '',
                asset.baseCost || '',
                asset.estimatedClicks || '',
                asset.estimatedImpressions || '',
                asset.ctr || '16%',
                `${asset.budgetPercent || ''}%`,
                asset.budgetAmount || '',
                asset.targeting?.geographic || '',
                asset.targeting?.deviceSplit || ''
              ].map(cell => {
                // Escape quotes and wrap in quotes if cell contains commas or newlines
                let value = String(cell);
                if (value.includes('"')) {
                  value = value.replace(/"/g, '""');
                }
                if (value.includes(',') || value.includes('\n') || value.includes('"')) {
                  value = `"${value}"`;
                }
                return value;
              }).join(',');
              
              csvContent += row + '\n';
            });
          }
          
          csvContent += '\n';
        });
      }
      
      // Add recommendation if exists
      if (content.recommendation) {
        csvContent += 'Recommendation\n';
        csvContent += `${content.recommendation}\n\n`;
      }
      
      // Add next steps if exists
      if (content.nextSteps && content.nextSteps.length > 0) {
        csvContent += 'Next Steps\n';
        content.nextSteps.forEach((step: string, index: number) => {
          csvContent += `${index + 1}. ${step}\n`;
        });
      }
      
      // Encode the CSV content
      const encodedUri = encodeURI(csvContent);
      
      // Create a link to the Google Sheets new document URL with CSV data
      const googleSheetsUrl = `https://docs.google.com/spreadsheets/create?usp=sheets_api&import=csv&data=${encodeURIComponent(csvContent)}`;
      
      // Open the URL in a new tab
      window.open(googleSheetsUrl, '_blank');
      
      toast({
        title: "Google Sheets opened",
        description: "Media plan has been exported to Google Sheets",
        variant: "default"
      });
    } catch (error) {
      console.error("Error exporting to Google Sheets:", error);
      toast({
        title: "Export failed",
        description: "Failed to export media plan to Google Sheets",
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
          // Process assets and update estimations including filling N/A values
          const processedAssets = option.assets?.map((asset: any) => {
            const estimates = calculateEstimates(asset);
            
            // Check if we need to fill in any N/A values using the CTR formula
            if (estimates.estimatedClicks === "N/A" && estimates.estimatedImpressions !== "N/A") {
              // Calculate clicks from impressions and CTR
              const impressions = parseInt(estimates.estimatedImpressions.replace(/,/g, ''));
              if (!isNaN(impressions)) {
                const calculatedClicks = Math.round(impressions * estimates.ctr / 100);
                estimates.estimatedClicks = formatIndianNumber(calculatedClicks);
              }
            } else if (estimates.estimatedClicks !== "N/A" && estimates.estimatedImpressions === "N/A") {
              // Calculate impressions from clicks and CTR
              const clicks = parseInt(estimates.estimatedClicks.replace(/,/g, ''));
              if (!isNaN(clicks)) {
                const calculatedImpressions = Math.round(clicks * 100 / estimates.ctr);
                estimates.estimatedImpressions = formatIndianNumber(calculatedImpressions);
              }
            }
            
            return {
              ...asset,
              estimatedClicks: estimates.estimatedClicks,
              estimatedImpressions: estimates.estimatedImpressions,
              ctr: estimates.ctr
            };
          }) || [];

          return (
            <div key={key} className="pb-6">
              <h2 className="text-xl font-bold mb-4">{index + 1}. {option.planName}</h2>
              <div className="mb-4">
                <p><strong>Total Budget:</strong> ₹{formatIndianNumber(option.totalBudget)}</p>
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
                        <TableHead className="font-bold">CTR (%)</TableHead>
                        <TableHead className="font-bold">Budget Percent</TableHead>
                        <TableHead className="font-bold">Budget Amount</TableHead>
                        <TableHead className="font-bold">Targeting</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedAssets.map((asset: any, rowIndex: number) => (
                        <TableRow key={asset.assetId}>
                          <TableCell className="font-medium">{asset.assetName}</TableCell>
                          <TableCell>{asset.platform}</TableCell>
                          <TableCell>{asset.industry}</TableCell>
                          <TableCell>{asset.buyType}</TableCell>
                          <TableCell>₹{asset.baseCost}</TableCell>
                          <TableCell>{asset.estimatedClicks}</TableCell>
                          <TableCell>{asset.estimatedImpressions}</TableCell>
                          <TableCell>{asset.ctr}%</TableCell>
                          <TableCell>{asset.budgetPercent}%</TableCell>
                          <TableCell>
                            {editingCell && 
                             editingCell.optionKey === key && 
                             editingCell.rowIndex === rowIndex ? (
                              <div className="flex items-center gap-1">
                                <span className="text-sm">₹</span>
                                <Input 
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-24 h-8 py-1 px-2"
                                  autoFocus
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveEdit();
                                    if (e.key === 'Escape') handleCancelEdit();
                                  }}
                                />
                                <button 
                                  onClick={handleSaveEdit}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <Check size={16} className="text-green-600" />
                                </button>
                                <button 
                                  onClick={handleCancelEdit}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <X size={16} className="text-red-600" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 group">
                                <span>₹{formatIndianNumber(asset.budgetAmount)}</span>
                                <button 
                                  onClick={() => handleEditBudget(key, rowIndex, parseFloat(asset.budgetAmount))}
                                  className="ml-2 p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 focus:opacity-100"
                                  aria-label="Edit budget"
                                >
                                  <Edit size={14} />
                                </button>
                              </div>
                            )}
                          </TableCell>
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
      ) : processedResults ? (
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
                variant="outline" 
                onClick={handleExportToGoogleSheets}
                disabled={!processedResults}
                className="flex items-center gap-2"
              >
                <FileText size={16} />
                Open in Google Sheets
              </NeuButton>
            </div>

            {displayMode === 'formatted' ? (
              renderFormattedResponse(processedResults)
            ) : (
              <div>
                <h2 className="text-xl font-semibold mb-4">Raw Response Data</h2>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto text-sm">
                  <code>{formatJsonDisplay(processedResults)}</code>
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
