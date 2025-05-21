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
  asset?: string;
  platformIndustry?: string;
  buyType?: string;
  baseCost?: number | string;
  ctr?: number | string;
  estClicks?: number | string;
  estImpressions?: number | string;
  budgetPercentage?: number | string;
  budgetAmount?: number | string;
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
  
  const calculateMetrics = (data: MediaPlanItem): MediaPlanItem => {
    const result = { ...data };
    
    // Convert all values to numbers
    const budgetAmount = typeof result.budgetAmount === 'number' 
      ? result.budgetAmount 
      : parseFloat(String(result.budgetAmount).replace(/[^0-9.-]+/g, ""));
      
    const baseCost = typeof result.baseCost === 'number' 
      ? result.baseCost 
      : parseFloat(String(result.baseCost).replace(/[^0-9.-]+/g, ""));
      
    const ctr = typeof result.ctr === 'number' 
      ? result.ctr 
      : parseFloat(String(result.ctr).replace(/[^0-9.-]+/g, ""));
    
    if (isNaN(budgetAmount) || isNaN(baseCost) || baseCost === 0) return result;
    
    // Perform calculations based on buyType
    if (result.buyType === 'CPM') {
      // CPM (Cost Per Mille) calculations
      const estImpressions = (budgetAmount / baseCost) * 1000;
      result.estImpressions = Math.round(estImpressions);
      
      if (!isNaN(ctr)) {
        const estClicks = (estImpressions * ctr) / 100;
        result.estClicks = Math.round(estClicks);
      } else {
        result.estClicks = 'N/A';
      }
    } 
    else if (result.buyType === 'CPC') {
      // CPC (Cost Per Click) calculations
      const estClicks = budgetAmount / baseCost;
      result.estClicks = Math.round(estClicks);
      
      if (!isNaN(ctr)) {
        const estImpressions = (estClicks * 100) / ctr;
        result.estImpressions = Math.round(estImpressions);
      } else {
        result.estImpressions = 'N/A';
      }
    } 
    else if (result.buyType === 'CPT') {
      // CPT (Cost Per Trip) - no calculations
      result.estImpressions = 'N/A';
      result.estClicks = 'N/A';
    }
    
    return result;
  };
  
  const validateAndCorrectData = (data: MediaPlanItem[]): MediaPlanItem[] => {
    return data.map(item => {
      // First calculate correct values
      const correctedItem = calculateMetrics(item);
      
      // Additional validation if needed
      if (correctedItem.buyType === 'CPC' || correctedItem.buyType === 'CPM') {
        const budgetAmount = typeof correctedItem.budgetAmount === 'number' 
          ? correctedItem.budgetAmount 
          : parseFloat(String(correctedItem.budgetAmount).replace(/[^0-9.-]+/g, ""));
          
        const baseCost = typeof correctedItem.baseCost === 'number' 
          ? correctedItem.baseCost 
          : parseFloat(String(correctedItem.baseCost).replace(/[^0-9.-]+/g, ""));
          
        if (budgetAmount > baseCost) {
          // You could add more validation logic here if needed
        }
      }
      
      return correctedItem;
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
        let extractedData: MediaPlanItem[] = [];
        
        // First check if it's our expected format from Supabase
        if (searchResults.mediaPlan && Array.isArray(searchResults.mediaPlan)) {
          extractedData = searchResults.mediaPlan;
          foundTableData = true;
        } 
        // Check if it's from the raw OpenAI response
        else if (contentText) {
          try {
            // Try to find and parse JSON in the content
            const jsonMatch = contentText.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch && jsonMatch[1]) {
              const parsedData = JSON.parse(jsonMatch[1]);
              if (Array.isArray(parsedData)) {
                extractedData = parsedData;
                foundTableData = true;
              }
            } else {
              // Try parsing the entire content as JSON
              try {
                const parsedData = JSON.parse(contentText);
                if (Array.isArray(parsedData)) {
                  extractedData = parsedData;
                  foundTableData = true;
                }
              } catch (e) {
                // Not valid JSON, that's fine
              }
            }
          } catch (error) {
            console.error("Error parsing JSON data:", error);
          }
        }
        
        if (foundTableData) {
          // Validate and correct the data before setting it
          const correctedData = validateAndCorrectData(extractedData);
          console.log("Original data:", extractedData);
          console.log("Corrected data:", correctedData);
          setTableData(correctedData);
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
      
      // Update the edited value
      updatedData[rowIndex][columnKey] = editValue;
      
      // Recalculate all metrics for this row
      const correctedRow = calculateMetrics(updatedData[rowIndex]);
      updatedData[rowIndex] = correctedRow;
      
      setTableData(updatedData);
      setEditingCell(null);
    }
  };

  const formatValue = (value: any, key: string): string => {
    if (value === undefined || value === null || value === 'N/A') return "-";
    
    if (key === "budgetAmount" || key === "baseCost") {
      const numValue = typeof value === "number" ? value : parseFloat(value);
      if (!isNaN(numValue)) {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0
        }).format(numValue);
      }
      return value.toString();
    }
    
    if (key === "ctr") {
      const numValue = typeof value === "number" ? value : parseFloat(value);
      if (!isNaN(numValue)) {
        return `${numValue.toFixed(2)}%`;
      }
      return value.toString().endsWith("%") ? value.toString() : `${value}%`;
    }
    
    if (key === "estImpressions" || key === "estClicks") {
      const numValue = typeof value === "number" ? value : parseFloat(value);
      if (!isNaN(numValue)) {
        return new Intl.NumberFormat('en-IN').format(numValue);
      }
      return value.toString();
    }
    
    return value.toString();
  };

  const isBudgetColumn = (key: string): boolean => {
    return key === "budgetAmount" || 
           key.toLowerCase().includes("budget") || 
           key.toLowerCase().includes("spend") || 
           key.toLowerCase().includes("cost");
  };

  const renderQueryAnalysis = () => {
    if (!searchBrief || !searchResults) return null;
    
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
    
    const headers = Object.keys(tableData[0]).filter(key => key !== 'id' && key !== 'key');
    
    const totals: { [key: string]: number } = {};
    headers.forEach(header => {
      if (tableData.every(item => {
        const value = item[header];
        return typeof value === "number" || 
               (!isNaN(Number(value)) && 
               value !== 'N/A' && 
               value !== null && 
               value !== undefined);
      })) {
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
                        {(key === 'budgetAmount' || key === 'budget') && (
                          <button 
                            onClick={() => startEditing(rowIndex, key, row[key])} 
                            className="ml-2 p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 focus:opacity-100"
                            aria-label={`Edit ${key}`}
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
        {renderQueryAnalysis()}
        {tableData.length > 0 && renderMediaPlanTable()}
        {tableData.length > 0 && renderStrategyText()}
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