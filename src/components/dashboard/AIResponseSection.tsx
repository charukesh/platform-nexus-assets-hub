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
  budget?: number | string;
  impressions?: number | string;
  clicks?: number | string;
  ctr?: number | string;
  cpc?: number | string;
  assetName?: string;
  platformIndustry?: string;
  buyType?: string;
  baseCost?: number | string;
  estClicks?: number | string;
  estImpressions?: number | string;
  budgetPercent?: number | string;
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
        
        // First check if it's our expected format from Supabase
        if (searchResults.mediaPlan && Array.isArray(searchResults.mediaPlan)) {
          console.log("Setting table data from mediaPlan array:", searchResults.mediaPlan);
          setTableData(processMediaPlanData(searchResults.mediaPlan));
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
                console.log("Setting table data from JSON match:", parsedData);
                setTableData(processMediaPlanData(parsedData));
                foundTableData = true;
              }
            } else {
              // Try parsing the entire content as JSON
              try {
                const parsedData = JSON.parse(contentText);
                if (Array.isArray(parsedData)) {
                  console.log("Setting table data from direct JSON parse:", parsedData);
                  setTableData(processMediaPlanData(parsedData));
                  foundTableData = true;
                }
              } catch (e) {
                // Not valid JSON, that's fine
              }
              
              // Extract data from Markdown tables if present
              const extractedData = extractTableDataFromMarkdown(contentText);
              if (extractedData.length > 0) {
                console.log("Setting table data from Markdown tables:", extractedData);
                setTableData(processMediaPlanData(extractedData));
                foundTableData = true;
              }
            }
          } catch (error) {
            console.error("Error parsing JSON data:", error);
          }
        }
        
        if (!foundTableData) {
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

  // Function to extract table data from markdown
  const extractTableDataFromMarkdown = (markdown: string): MediaPlanItem[] => {
    const tableRegex = /\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/g;
    const headerRegex = /\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|\s*(.*?)\s*\|/;
    
    const tables = markdown.split(/##\s*OPTION/);
    
    let result: MediaPlanItem[] = [];
    
    tables.forEach(tableSection => {
      // Skip sections without tables
      if (!tableSection.includes("|")) return;
      
      const lines = tableSection.split("\n").filter(line => line.trim().length > 0 && line.includes("|"));
      
      // Skip if not enough lines for a table (header, separator, and at least one row)
      if (lines.length < 3) return;
      
      // Extract header
      const headerMatch = lines[0].match(headerRegex);
      if (!headerMatch) return;
      
      // Create header mapping, removing leading/trailing spaces and normalizing
      const headers = headerMatch.slice(1).map(header => {
        const clean = header.trim().toLowerCase()
          .replace(/\s+/g, " ")
          .replace(/\s([a-z])/g, (_, letter) => letter.toUpperCase())
          .replace(/^([a-z])/, (_, letter) => letter.toLowerCase());
        
        // Normalize common header variations
        if (clean.includes("platform")) return "platform";
        if (clean.includes("asset") && clean.includes("name")) return "assetName";
        if (clean.includes("industry")) return "platformIndustry";
        if (clean.includes("buy") && clean.includes("type")) return "buyType";
        if (clean.includes("base") && clean.includes("cost")) return "baseCost";
        if (clean.includes("ctr")) return "ctr";
        if (clean.includes("click") && !clean.includes("est")) return "clicks";
        if (clean.includes("click") && clean.includes("est")) return "estClicks";
        if (clean.includes("impression") && clean.includes("est")) return "estImpressions";
        if (clean.includes("budget") && clean.includes("%")) return "budgetPercent";
        if (clean.includes("budget") && clean.includes("amount")) return "budgetAmount";
        
        return clean;
      });
      
      // Skip separator line
      const dataLines = lines.slice(2);
      
      // Process each data row
      dataLines.forEach(line => {
        // Skip separator lines
        if (line.includes("---") || !line.includes("|")) return;
        
        const rowMatch = line.match(tableRegex);
        if (!rowMatch) return;
        
        const values = line.split("|")
          .map(cell => cell.trim())
          .filter(cell => cell.length > 0);
        
        if (values.length < headers.length) return;
        
        const row: MediaPlanItem = {};
        
        // Map values to headers
        headers.forEach((header, index) => {
          if (header && values[index]) {
            // Convert numeric values
            let value = values[index];
            if (value === "N/A") {
              row[header] = "N/A";
            } else if (
              ["baseCost", "budgetAmount", "estClicks", "estImpressions", "budgetPercent"].includes(header)
            ) {
              // Remove non-numeric characters except decimal points
              const numericValue = value.replace(/[^\d.]/g, "");
              row[header] = numericValue ? parseFloat(numericValue) : value;
            } else {
              row[header] = value;
            }
          }
        });
        
        result.push(row);
      });
    });
    
    return result;
  };

  // Process and calculate missing values in media plan data
  const processMediaPlanData = (data: MediaPlanItem[]): MediaPlanItem[] => {
    return data.map(item => {
      const processedItem = { ...item };
      
      // Normalize key names
      Object.keys(processedItem).forEach(key => {
        const lowerKey = key.toLowerCase();
        
        // Map common key variations to standardized keys
        if (lowerKey.includes("asset") && lowerKey.includes("name")) {
          processedItem.assetName = processedItem[key];
          if (key !== "assetName") delete processedItem[key];
        }
        if (lowerKey.includes("platform") && lowerKey.includes("industry")) {
          processedItem.platformIndustry = processedItem[key];
          if (key !== "platformIndustry") delete processedItem[key];
        }
        if (lowerKey.includes("buy") && lowerKey.includes("type")) {
          processedItem.buyType = processedItem[key];
          if (key !== "buyType") delete processedItem[key];
        }
        if (lowerKey.includes("base") && lowerKey.includes("cost")) {
          processedItem.baseCost = processedItem[key];
          if (key !== "baseCost") delete processedItem[key];
        }
        if (lowerKey === "ctr %") {
          processedItem.ctr = processedItem[key];
          if (key !== "ctr") delete processedItem[key];
        }
        if (lowerKey.includes("est") && lowerKey.includes("click")) {
          processedItem.estClicks = processedItem[key];
          if (key !== "estClicks") delete processedItem[key];
        }
        if (lowerKey.includes("est") && lowerKey.includes("impression")) {
          processedItem.estImpressions = processedItem[key];
          if (key !== "estImpressions") delete processedItem[key];
        }
        if (lowerKey.includes("budget") && lowerKey.includes("%")) {
          processedItem.budgetPercent = processedItem[key];
          if (key !== "budgetPercent") delete processedItem[key];
        }
        if (lowerKey.includes("budget") && lowerKey.includes("amount")) {
          processedItem.budgetAmount = processedItem[key];
          if (key !== "budgetAmount") delete processedItem[key];
        }
      });
      
      // Convert string values to numbers where appropriate
      if (typeof processedItem.baseCost === "string") {
        processedItem.baseCost = parseFloat(processedItem.baseCost.replace(/[^\d.]/g, ""));
      }
      
      if (typeof processedItem.budgetAmount === "string") {
        processedItem.budgetAmount = parseFloat(processedItem.budgetAmount.replace(/[^\d.]/g, ""));
      }
      
      // Calculate estClicks for CPC items
      if (
        processedItem.buyType && 
        processedItem.buyType.toUpperCase() === "CPC" && 
        processedItem.budgetAmount && 
        processedItem.baseCost && 
        typeof processedItem.budgetAmount === "number" && 
        typeof processedItem.baseCost === "number" && 
        processedItem.baseCost > 0
      ) {
        processedItem.estClicks = Math.round(processedItem.budgetAmount / processedItem.baseCost);
      }
      
      return processedItem;
    });
  };

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
        
        // Update related metrics proportionally
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
    if (value === undefined || value === null || value === "") return "-";
    
    if (key === "budgetAmount") {
      return typeof value === "number" 
        ? `₹${value.toLocaleString()}` 
        : value.toString().startsWith("₹") || value.toString().startsWith("$")
          ? value.toString() 
          : `₹${value}`;
    }
    
    if (key === "baseCost") {
      return typeof value === "number" 
        ? `₹${value}` 
        : value.toString().startsWith("₹") || value.toString().startsWith("$")
          ? value.toString() 
          : `₹${value}`;
    }
    
    if (key === "budgetPercent" || key === "ctr") {
      const numValue = typeof value === "number" ? value : parseFloat(value);
      if (!isNaN(numValue)) {
        // Convert from decimal to percentage if needed
        return numValue > 1 ? `${numValue}%` : `${(numValue * 100).toFixed(2)}%`;
      }
      return value.toString().endsWith("%") ? value.toString() : `${value}%`;
    }
    
    if (key === "estImpressions" || key === "estClicks") {
      return typeof value === "number" 
        ? value.toLocaleString() 
        : value.toString();
    }
    
    return value.toString();
  };

  const isEditableColumn = (key: string): boolean => {
    return key === "budgetAmount" || key === "baseCost";
  };

  const renderQueryAnalysis = () => {
    if (!searchBrief || !searchResults) return null;
    
    // Extract location from search brief
    const locationMatch = searchBrief.match(/\b(bangalore|banglore|bengaluru|karnataka)\b/i);
    const location = locationMatch ? locationMatch[0].charAt(0).toUpperCase() + locationMatch[0].slice(1) : "Not specified";
    
    // Extract budget from search brief
    const budgetMatch = searchBrief.match(/(\d+)[Ll]\s*budget/);
    const budget = budgetMatch ? budgetMatch[1] + "L" : "Not specified";
    
    return (
      <div className="mb-6 space-y-3">
        <h2 className="text-xl font-semibold">Query Analysis</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><span className="font-medium">Geographic targeting:</span> {location}</li>
          <li><span className="font-medium">Budget requirements:</span> {budget}</li>
          <li><span className="font-medium">Number of assets requested:</span> Not specified; default to max 3 per plan</li>
          <li><span className="font-medium">Platforms/Industries requested:</span> Not specified; all industries allowed</li>
          <li><span className="font-medium">Targeting requirements:</span> No specific demographic, interest, or behavioral targeting mentioned</li>
        </ul>
      </div>
    );
  };

  const renderMediaPlanTable = () => {
    if (tableData.length === 0) return null;
    
    // Extract headers from the data, normalizing key names
    const priorityHeaders = [
      "platform", "assetName", "platformIndustry", "buyType", "baseCost", 
      "ctr", "estClicks", "estImpressions", "budgetPercent", "budgetAmount"
    ];
    
    // Get all available keys from the data
    const allKeys = new Set<string>();
    tableData.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key));
    });
    
    // Order headers with priority headers first, then any others
    const headers = [
      ...priorityHeaders.filter(key => Array.from(allKeys).some(k => k === key)),
      ...Array.from(allKeys).filter(key => !priorityHeaders.includes(key))
    ];
    
    // Calculate totals for numeric columns
    const totals: { [key: string]: number } = {};
    headers.forEach(header => {
      // Only calculate totals for these specific columns
      if (["budgetAmount", "estClicks", "estImpressions"].includes(header)) {
        totals[header] = tableData.reduce((sum, item) => {
          const value = typeof item[header] === "number" 
            ? item[header] as number 
            : typeof item[header] === "string" 
              ? parseFloat(item[header].replace(/[^\d.]/g, ""))
              : 0;
          return sum + (isNaN(value) ? 0 : value);
        }, 0);
      }
    });
    
    // Clean up header display names
    const headerDisplayNames: { [key: string]: string } = {
      platform: "Platform",
      assetName: "Asset Name",
      platformIndustry: "Platform Industry",
      buyType: "Buy Type",
      baseCost: "Base Cost (₹)",
      ctr: "CTR %",
      estClicks: "Est. Clicks",
      estImpressions: "Est. Impressions",
      budgetPercent: "Budget %",
      budgetAmount: "Budget Amount (₹)"
    };
    
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
                <TableHead key={header} className="font-semibold">
                  {headerDisplayNames[header] || 
                   header.replace(/([A-Z])/g, " $1").trim().replace(/^./, str => str.toUpperCase())}
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
                        {isEditableColumn(key) && (
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
            
            {/* Totals row */}
            {Object.keys(totals).length > 0 && (
              <TableRow className="border-t-2 font-semibold">
                {headers.map(header => (
                  <TableCell key={`total-${header}`}>
                    {totals[header] !== undefined 
                      ? formatValue(totals[header], header)
                      : header === "platform" ? "TOTAL" : ""}
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
        <h2 className="text-xl font-semibold">Marketing Strategy</h2>
        <p className="text-base leading-relaxed mt-2">
          {searchBrief && searchBrief.toLowerCase().includes('bangalore') ? (
            <>
              This media plan focuses on digital assets with precise city-level targeting for Bangalore, 
              ensuring your message reaches the right audience in this tech-savvy urban market. 
              The selected platforms represent key touchpoints in the daily digital journey of Bangalore consumers,
              from food delivery apps to entertainment discovery and music streaming services.
              Budget allocation is optimized to balance awareness and conversion opportunities across these
              high-engagement platforms.
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
    
    // Extract only the recommendation and next steps sections if they exist
    const recommendationMatch = markdownContent.match(/##\s*Recommendation([\s\S]*?)(?=##|$)/i);
    const nextStepsMatch = markdownContent.match(/##\s*Next Steps([\s\S]*?)(?=##|$)/i);
    
    const recommendation = recommendationMatch ? recommendationMatch[1].trim() : "";
    const nextSteps = nextStepsMatch ? nextStepsMatch[1].trim() : "";
    
    if (!recommendation && !nextSteps) return null;
    
    return (
      <div className="mt-6 space-y-4">
        {recommendation && (
          <div>
            <h2 className="text-xl font-semibold">Recommendation</h2>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]} 
              className="prose prose-sm max-w-full dark:prose-invert mt-2"
            >
              {recommendation}
            </ReactMarkdown>
          </div>
        )}
        
        {nextSteps && (
          <div>
            <h2 className="text-xl font-semibold">Next Steps</h2>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              rehypePlugins={[rehypeRaw]} 
              className="prose prose-sm max-w-full dark:prose-invert mt-2"
            >
              {nextSteps}
            </ReactMarkdown>
          </div>
        )}
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
        
        {/* Render markdown content (recommendation and next steps) if available */}
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