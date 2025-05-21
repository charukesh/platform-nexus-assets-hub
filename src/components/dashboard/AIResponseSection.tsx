import React, { useRef, useEffect, useState, ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Loader2, Search, Edit, Check, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import NeuButton from '@/components/NeuButton';
import NeuCard from '@/components/NeuCard';
import * as emoji from 'node-emoji';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

interface AIResponseSectionProps {
  searchBrief: string;
  searchResults: any;
  searchLoading: boolean;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSearchBriefChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onClear: () => void;
}

interface MediaPlanItem {
  platform?: string;
  format?: string;
  buyType?: string;
  baseCost?: number | string;
  budget?: number | string;
  impressions?: number | string;
  clicks?: number | string;
  ctr?: number | string;
  cpc?: number | string;
  [key: string]: any;
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
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    columnKey: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [tableData, setTableData] = useState<MediaPlanItem[]>([]);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  
  // Function to determine if a row has CPC buy type
  const isCpcBuyType = (item: MediaPlanItem): boolean => {
    const buyType = item.buyType?.toString().toLowerCase() || '';
    const format = item.format?.toString().toLowerCase() || '';
    
    return buyType === 'cpc' || 
           format.includes('cpc') || 
           format.includes('cost per click') ||
           format.includes('paid search') ||
           format.includes('search ads');
  };
  
  // Function to parse structured text into table data (for tables like the one in your input)
  const parseStructuredText = (text: string): MediaPlanItem[] => {
    try {
      // Remove any markdown formatting and extra whitespace
      const cleanText = text.replace(/\*\*/g, '').trim();
      
      // Split by newlines to get rows
      const rows = cleanText.split('\n').filter(row => row.trim().length > 0);
      
      if (rows.length <= 1) {
        return [];
      }
      
      // Attempt to identify headers
      // This is a heuristic approach - we're looking for common column names
      const headerRow = rows[0].toLowerCase();
      
      // Extract column positions based on common keywords
      const columnPositions: {[key: string]: {start: number, end?: number}} = {};
      
      // Check for common column names and their positions
      const commonColumns = [
        { key: 'platform', patterns: ['platform'] },
        { key: 'asset', patterns: ['asset', 'format'] },
        { key: 'industry', patterns: ['industry', 'platform industry'] },
        { key: 'buyType', patterns: ['buy type', 'buytype', 'buy', 'type'] },
        { key: 'baseCost', patterns: ['base cost', 'basecost', 'cost', 'cpc'] },
        { key: 'ctr', patterns: ['ctr', 'ctr %'] },
        { key: 'clicks', patterns: ['est clicks', 'clicks', 'estimated clicks'] },
        { key: 'impressions', patterns: ['est impressions', 'impressions', 'estimated impressions'] },
        { key: 'budgetPercentage', patterns: ['budget %', 'budget percentage'] },
        { key: 'budget', patterns: ['budget amount', 'budget', 'amount'] }
      ];
      
      // Process each data row
      const tableData: MediaPlanItem[] = [];
      
      // Skip header row if it exists, process other rows as data
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        // Check if this might be a data row (contains currency symbols or numbers)
        if (row.match(/[₹$]|[0-9]+/) || row.match(/CPC|CPM|CPV/i)) {
          // This is likely a data row
          const item: MediaPlanItem = {};
          
          // Extract platform (usually first word or segment)
          const platformMatch = row.match(/^([A-Za-z0-9]+)/);
          if (platformMatch) {
            item.platform = platformMatch[1].trim();
          }
          
          // Extract buy type (CPC, CPM, etc.)
          const buyTypeMatch = row.match(/\b(CPC|CPM|CPV)\b/i);
          if (buyTypeMatch) {
            item.buyType = buyTypeMatch[1].trim();
          }
          
          // Extract base cost (currency amounts like ₹10)
          const baseCostMatch = row.match(/[₹$]\s*([0-9,]+)/);
          if (baseCostMatch) {
            item.baseCost = parseFloat(baseCostMatch[1].replace(/,/g, ''));
          }
          
          // Extract budget amount (usually last currency value)
          const budgetMatch = row.match(/[₹$]\s*([0-9,]+)\s*$/);
          if (budgetMatch) {
            item.budget = parseFloat(budgetMatch[1].replace(/,/g, ''));
          }
          
          // Extract other numbers that could be clicks or impressions
          const numberMatches = row.match(/\b([0-9,]+)\b/g);
          if (numberMatches && numberMatches.length >= 3) {
            // Assume one of the larger numbers is impressions
            const numbers = numberMatches.map(n => parseInt(n.replace(/,/g, '')));
            numbers.sort((a, b) => b - a);
            
            // Largest is likely impressions if very large
            if (numbers[0] > 10000) {
              item.impressions = numbers[0];
            }
            
            // Find the number that's most likely to be clicks
            for (const num of numbers) {
              if (num < item.impressions && num > 1000) {
                item.clicks = num;
                break;
              }
            }
          }
          
          // If we have budget and baseCost for CPC but no clicks, calculate them
          if (item.buyType?.toLowerCase() === 'cpc' && 
              item.budget && item.baseCost && 
              !item.clicks && item.baseCost > 0) {
            item.clicks = Math.round(Number(item.budget) / Number(item.baseCost));
          }
          
          // Add the row to our table data if it has at least some basic info
          if (item.platform && (item.budget || item.clicks || item.impressions)) {
            tableData.push(item);
          }
        }
      }
      
      console.log("Parsed structured text data:", tableData);
      return tableData;
    } catch (error) {
      console.error("Error parsing structured text:", error);
      return [];
    }
  };
  
  // Function to recalculate clicks for CPC buy types
  const recalculateClicks = (data: MediaPlanItem[]): MediaPlanItem[] => {
    return data.map(item => {
      const updatedItem = { ...item };
      
      if (isCpcBuyType(item)) {
        // Extract budget value
        const budget = typeof item.budget === 'number' ? 
          item.budget : 
          parseFloat(String(item.budget || '0').replace(/[^0-9.-]+/g, ""));
        
        // Extract base cost value (CPC)
        const baseCost = typeof item.baseCost === 'number' ? 
          item.baseCost : 
          typeof item.cpc === 'number' ?
            item.cpc :
            parseFloat(String(item.baseCost || item.cpc || '0').replace(/[^0-9.-]+/g, ""));
        
        // Calculate clicks if we have valid budget and baseCost
        if (!isNaN(budget) && !isNaN(baseCost) && baseCost > 0) {
          // Calculate estimated clicks as budget / baseCost
          updatedItem.clicks = Math.round(budget / baseCost);
          
          // Log calculation for debugging
          console.log(`CPC calculation for ${item.platform}: ${budget} / ${baseCost} = ${updatedItem.clicks} clicks`);
          
          // Also update CPC to ensure consistency
          updatedItem.cpc = baseCost;
          
          // If we have impressions, update CTR
          const impressions = typeof item.impressions === 'number' ? 
            item.impressions : 
            parseFloat(String(item.impressions || '0').replace(/[^0-9.-]+/g, ""));
            
          if (!isNaN(impressions) && impressions > 0) {
            updatedItem.ctr = updatedItem.clicks / impressions;
          }
        }
      }
      
      return updatedItem;
    });
  };

  useEffect(() => {
    // Process search results for both table data and markdown content
    if (searchResults) {
      try {
        // Extract markdown content first
        let contentText = "";
        if (searchResults.choices && searchResults.choices[0]?.message?.content) {
          contentText = searchResults.choices[0].message.content;
        } else if (searchResults.rawResponse?.choices?.[0]?.message?.content) {
          contentText = searchResults.rawResponse.choices[0].message.content;
        } else if (typeof searchResults === 'string') {
          contentText = searchResults;
        } else if (searchResults.content) {
          contentText = searchResults.content;
        }
        
        // Clean and store markdown content
        const cleanContent = contentText.replace(/```json\s*[\s\S]*?\s*```/g, '');
        const emojifiedContent = emoji.emojify(cleanContent);
        setMarkdownContent(emojifiedContent);
        
        // Now try to extract table data
        let foundTableData = false;
        let parsedTableData: MediaPlanItem[] = [];
        
        // First check if it's our expected format from Supabase
        if (searchResults.mediaPlan && Array.isArray(searchResults.mediaPlan)) {
          console.log("Setting table data from mediaPlan array:", searchResults.mediaPlan);
          parsedTableData = searchResults.mediaPlan;
          foundTableData = true;
        } 
        // Check if it's from the raw OpenAI response
        else if (contentText) {
          try {
            // Try to find and parse JSON in the content
            const jsonMatch = contentText.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch && jsonMatch[1]) {
              parsedTableData = JSON.parse(jsonMatch[1]);
              if (Array.isArray(parsedTableData)) {
                console.log("Setting table data from JSON match:", parsedTableData);
                foundTableData = true;
              }
            } else {
              // Try parsing the entire content as JSON
              try {
                parsedTableData = JSON.parse(contentText);
                if (Array.isArray(parsedTableData)) {
                  console.log("Setting table data from direct JSON parse:", parsedTableData);
                  foundTableData = true;
                }
              } catch (e) {
                // Not JSON, try to parse it as a structured text table
                const structuredData = parseStructuredText(contentText);
                if (structuredData.length > 0) {
                  parsedTableData = structuredData;
                  foundTableData = true;
                  console.log("Setting table data from structured text parse:", structuredData);
                }
              }
            }
          } catch (error) {
            console.error("Error parsing JSON data:", error);
          }
        }
        
        if (foundTableData && Array.isArray(parsedTableData)) {
          // Apply click calculation for CPC buy types
          const processedData = recalculateClicks(parsedTableData);
          setTableData(processedData);
        } else {
          // Clear any previous table data
          setTableData([]);
        }
      } catch (error) {
        console.error("Error processing search results:", error);
      }
    } else {
      // Clear states when no results
      setMarkdownContent("");
      setTableData([]);
    }
  }, [searchResults]);

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

  const startEditing = (rowIndex: number, columnKey: string, value: any) => {
    setEditingCell({ rowIndex, columnKey });
    setEditValue(value?.toString() || "");
  };

  const saveEditedValue = () => {
    if (editingCell) {
      const { rowIndex, columnKey } = editingCell;
      const updatedData = [...tableData];
      
      // Convert to numeric values for calculations
      const rawOriginalValue = updatedData[rowIndex][columnKey];
      const originalValue = typeof rawOriginalValue === 'number' ? 
        rawOriginalValue : 
        parseFloat(String(rawOriginalValue).replace(/[^0-9.-]+/g, ""));
      
      const newValue = parseFloat(editValue.replace(/[^0-9.-]+/g, ""));
      
      if (columnKey === "budget" && !isNaN(newValue) && !isNaN(originalValue)) {
        // Calculate the ratio between new and old budget
        const ratio = newValue / originalValue;
        
        // Update budget
        updatedData[rowIndex][columnKey] = newValue;
        
        // For CPC buy types, recalculate clicks directly based on CPC
        if (isCpcBuyType(updatedData[rowIndex])) {
          const baseCost = typeof updatedData[rowIndex].baseCost === 'number' ? 
            updatedData[rowIndex].baseCost : 
            typeof updatedData[rowIndex].cpc === 'number' ?
              updatedData[rowIndex].cpc :
              parseFloat(String(updatedData[rowIndex].baseCost || updatedData[rowIndex].cpc || '0').replace(/[^0-9.-]+/g, ""));
          
          if (!isNaN(baseCost) && baseCost > 0) {
            // For CPC campaigns, clicks = budget / cpc
            updatedData[rowIndex].clicks = Math.round(newValue / baseCost);
            
            // Log the calculation for debugging
            console.log(`Calculating clicks for row ${rowIndex}: ${newValue} / ${baseCost} = ${updatedData[rowIndex].clicks}`);
          }
        } else {
          // For non-CPC campaigns, scale impressions and clicks proportionally
          if (updatedData[rowIndex].impressions !== undefined) {
            const impressionsValue = typeof updatedData[rowIndex].impressions === 'number' ? 
              updatedData[rowIndex].impressions : 
              parseFloat(String(updatedData[rowIndex].impressions).replace(/[^0-9.-]+/g, ""));
              
            if (!isNaN(impressionsValue)) {
              updatedData[rowIndex].impressions = Math.round(impressionsValue * ratio);
            }
          }
          
          if (updatedData[rowIndex].clicks !== undefined) {
            const clicksValue = typeof updatedData[rowIndex].clicks === 'number' ? 
              updatedData[rowIndex].clicks : 
              parseFloat(String(updatedData[rowIndex].clicks).replace(/[^0-9.-]+/g, ""));
              
            if (!isNaN(clicksValue)) {
              updatedData[rowIndex].clicks = Math.round(clicksValue * ratio);
            }
          }
        }
        
        // Recalculate CPC and CTR based on new values
        const clicksValue = typeof updatedData[rowIndex].clicks === 'number' ? 
          updatedData[rowIndex].clicks : 
          parseFloat(String(updatedData[rowIndex].clicks).replace(/[^0-9.-]+/g, ""));
        
        const impressionsValue = typeof updatedData[rowIndex].impressions === 'number' ? 
          updatedData[rowIndex].impressions : 
          parseFloat(String(updatedData[rowIndex].impressions).replace(/[^0-9.-]+/g, ""));
        
        if (!isNaN(clicksValue) && clicksValue > 0) {
          updatedData[rowIndex].cpc = newValue / clicksValue;
        }
        
        if (!isNaN(clicksValue) && !isNaN(impressionsValue) && impressionsValue > 0) {
          updatedData[rowIndex].ctr = clicksValue / impressionsValue;
        }
      } else {
        updatedData[rowIndex][columnKey] = editValue;
      }
      
      console.log("Updated data:", updatedData);
      setTableData(updatedData);
      setEditingCell(null);
    }
  };

  const formatValue = (value: any, key: string): string => {
    if (value === undefined || value === null) return "-";
    
    if (key === "budget") {
      return typeof value === "number" 
        ? `$${value.toLocaleString()}` 
        : value.toString().startsWith("$") 
          ? value.toString() 
          : `$${value}`;
    }
    
    if (key === "ctr" || key === "conversionRate") {
      const numValue = typeof value === "number" ? value : parseFloat(value);
      if (!isNaN(numValue)) {
        // Convert from decimal to percentage (e.g., 0.05 to 5%)
        return `${(numValue * 100).toFixed(2)}%`;
      }
      return value.toString().endsWith("%") ? value.toString() : `${value}%`;
    }
    
    if (key === "impressions" || key === "clicks" || key === "conversions") {
      return typeof value === "number" 
        ? value.toLocaleString() 
        : value.toString();
    }
    
    if (key === "cpc" || key === "cpa" || key === "baseCost") {
      const numValue = typeof value === "number" ? value : parseFloat(value);
      if (!isNaN(numValue)) {
        return `$${numValue.toFixed(2)}`;
      }
      return value.toString().startsWith("$") ? value.toString() : `$${value}`;
    }
    
    return value.toString();
  };

  const isBudgetColumn = (key: string): boolean => {
    return key === "budget" || 
           key.toLowerCase().includes("budget") || 
           key.toLowerCase().includes("spend") || 
           key.toLowerCase().includes("cost");
  };

  const renderQueryAnalysis = () => {
    if (!searchBrief || !searchResults) return null;
    
    // Extract budget from search brief (this is simplified - could be improved)
    const budgetMatch = searchBrief.match(/(\d+)[Ll]\s*budget/);
    const budget = budgetMatch ? budgetMatch[1] : "Not specified";

    const mainKeywordMatch = searchBrief.match(/for\s+(\w+)/);
    const mainKeyword = mainKeywordMatch ? mainKeywordMatch[1] : "Not specified";
    
    return (
      <div className="mb-6 space-y-3">
        <h2 className="text-xl font-semibold">1. Query Analysis</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><span className="font-medium">Budget requirements:</span> {budget}L</li>
          <li><span className="font-medium">Number of assets requested:</span> Not specified; default to max 3 per plan as per instructions</li>
          <li><span className="font-medium">Number of platforms requested:</span> Not specified; default to diversity for reach</li>
          <li><span className="font-medium">Industry filtering:</span> None specified; all industries allowed</li>
          <li><span className="font-medium">Budget allocation preferences:</span> None specified; use standard splits per plan type</li>
          <li><span className="font-medium">Platform prioritization:</span> None specified</li>
          <li><span className="font-medium">Targeting requirements:</span> No specific geographic, demographic, interest, or behavioral targeting mentioned in the query</li>
          <li><span className="font-medium">Other notes:</span> {mainKeyword} is a mass-market consumer electronics brand. Plans should balance reach, engagement, and relevance across high-traffic and contextually relevant digital platforms.</li>
        </ul>
      </div>
    );
  };

  const renderMediaPlanTable = () => {
    if (tableData.length === 0) return null;
    
    // Extract headers from the data
    const headers = Object.keys(tableData[0]).filter(key => key !== 'id' && key !== 'key');
    
    // Calculate totals for numeric columns
    const totals: { [key: string]: number } = {};
    headers.forEach(header => {
      if (tableData.every(item => typeof item[header] === "number" || !isNaN(Number(item[header])))) {
        totals[header] = tableData.reduce((sum, item) => {
          const value = typeof item[header] === "number" 
            ? item[header] as number 
            : Number(item[header]);
          return sum + (isNaN(value) ? 0 : value);
        }, 0);
      }
    });
    
    return (
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Media Plan</h2>
          <p className="text-muted-foreground text-sm">
            Edit budget values to see how it affects impressions and clicks
          </p>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map(header => (
                <TableHead key={header} className="font-semibold capitalize">
                  {header.replace(/([A-Z])/g, " $1").trim()}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="group">
                {headers.map(key => (
                  <TableCell key={key} className="align-middle">
                    {editingCell && 
                     editingCell.rowIndex === rowIndex && 
                     editingCell.columnKey === key ? (
                      <div className="flex items-center">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full"
                          autoFocus
                        />
                        <button 
                          onClick={saveEditedValue} 
                          className="ml-2 p-1 hover:bg-gray-100 rounded"
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span>{formatValue(row[key], key)}</span>
                        {isBudgetColumn(key) && (
                          <button 
                            onClick={() => startEditing(rowIndex, key, row[key])} 
                            className="ml-2 p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 focus:opacity-100"
                            aria-label="Edit budget"
                          >
                            <Edit size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            
            {/* Totals row */}
            {Object.keys(totals).length > 0 && (
              <TableRow className="border-t-2 font-semibold">
                {headers.map(header => (
                  <TableCell key={`total-${header}`}>
                    {totals[header] !== undefined 
                      ? formatValue(totals[header], header)
                      : ""}
                  </TableCell>
                ))}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderStrategyText = () => {
    if (!searchResults) return null;
    
    return (
      <div className="mt-6">
        <p className="text-base leading-relaxed">
          {searchBrief && searchBrief.toLowerCase().includes('samsung') ? (
            <>
              Samsung is a global leader in electronics, and for a {searchBrief.match(/(\d+)[Ll]/)?.[1]}L budget, 
              the goal is to maximize reach and engagement across platforms where tech-savvy, urban, and aspirational 
              consumers spend their digital time. The plans above leverage assets with strong digital presence and targeting 
              options, mixing high-impact placements and contextual relevance to drive both awareness and action. Each plan 
              offers a unique mix for different marketing priorities.
            </>
          ) : (
            <>
              This media plan is designed to maximize reach and engagement across relevant platforms 
              for your target audience. The budget allocation focuses on a mix of high-impact placements 
              and performance-driven formats to drive both awareness and action, balancing reach with 
              engagement opportunities.
            </>
          )}
        </p>
      </div>
    );
  };

  const renderMarkdownContent = () => {
    if (!markdownContent) return null;
    
    return (
      <div className="mt-4">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]} 
          rehypePlugins={[rehypeRaw]} 
          className="prose prose-sm max-w-full dark:prose-invert"
        >
          {markdownContent || "No content received"}
        </ReactMarkdown>
      </div>
    );
  };

  const renderAIResponse = () => {
    if (!searchResults) return null;
    
    return (
      <div className="space-y-6">
        {/* Always render query analysis if available */}
        {renderQueryAnalysis()}
        
        {/* Render table if data is available */}
        {tableData.length > 0 && renderMediaPlanTable()}
        
        {/* Render strategy text if table data is available */}
        {tableData.length > 0 && renderStrategyText()}
        
        {/* Always render markdown content if available */}
        {renderMarkdownContent()}
      </div>
    );
  };

  return (
    <div>
      <form onSubmit={onSearchSubmit} className="flex gap-2 mb-4">
        <div className="relative flex-grow">
          <Textarea 
            placeholder="enter your detailed brief with the client name" 
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
          {renderAIResponse()}
        </NeuCard>
      ) : null}
    </div>
  );
};

export default AIResponseSection;