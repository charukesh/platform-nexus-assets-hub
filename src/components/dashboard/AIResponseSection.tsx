
import React, { useRef, useEffect, useState, ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Loader2, Search, Edit, Check } from 'lucide-react';
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
  
  useEffect(() => {
    // Parse and set table data if searchResults contain media plan JSON
    if (searchResults && searchResults.choices && searchResults.choices[0]?.message?.content) {
      const content = searchResults.choices[0].message.content;
      try {
        // Try to find and parse JSON in the content
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch && jsonMatch[1]) {
          const parsedData = JSON.parse(jsonMatch[1]);
          if (Array.isArray(parsedData)) {
            setTableData(parsedData);
          } else if (parsedData.mediaPlanItems && Array.isArray(parsedData.mediaPlanItems)) {
            setTableData(parsedData.mediaPlanItems);
          } else {
            // Handle object structure
            setTableData(Object.entries(parsedData).map(([key, value]) => {
              if (typeof value === 'object' && value !== null) {
                return { platform: key, ...value };
              }
              return { key, value };
            }));
          }
        }
      } catch (error) {
        console.error("Error parsing JSON data:", error);
      }
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
      const originalValue = Number(updatedData[rowIndex][columnKey]);
      const newValue = Number(editValue);
      
      if (columnKey === "budget" && !isNaN(newValue) && !isNaN(originalValue)) {
        // Calculate the ratio between new and old budget
        const ratio = newValue / originalValue;
        
        // Update budget
        updatedData[rowIndex][columnKey] = newValue;
        
        // Update related metrics proportionally
        if (updatedData[rowIndex].impressions !== undefined) {
          updatedData[rowIndex].impressions = Math.round(Number(updatedData[rowIndex].impressions) * ratio);
        }
        if (updatedData[rowIndex].clicks !== undefined) {
          updatedData[rowIndex].clicks = Math.round(Number(updatedData[rowIndex].clicks) * ratio);
        }
      } else {
        updatedData[rowIndex][columnKey] = editValue;
      }
      
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
      return typeof value === "number" 
        ? `${(value * 100).toFixed(2)}%` 
        : value.toString().endsWith("%") 
          ? value.toString() 
          : `${value}%`;
    }
    
    if (key === "impressions" || key === "clicks" || key === "conversions") {
      return typeof value === "number" 
        ? value.toLocaleString() 
        : value.toString();
    }
    
    if (key === "cpc" || key === "cpa") {
      return typeof value === "number" 
        ? `$${value.toFixed(2)}` 
        : value.toString().startsWith("$") 
          ? value.toString() 
          : `$${value}`;
    }
    
    return value.toString();
  };

  const isBudgetColumn = (key: string): boolean => {
    return key === "budget" || 
           key.toLowerCase().includes("budget") || 
           key.toLowerCase().includes("spend") || 
           key.toLowerCase().includes("cost") ||
           (typeof key === 'string' && key.includes('$'));
  };

  const renderAIResponse = () => {
    if (!searchResults) return null;
    
    // Check if we have table data to display
    if (tableData.length > 0) {
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
        <div className="mt-4">
          <div className="mb-4">
            <h3 className="text-lg font-bold">Media Plan</h3>
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
                        <div className="flex">
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
    }
    
    // Fallback to standard markdown rendering if no table data
    const content = searchResults.choices?.[0]?.message?.content || '';
    // Remove any JSON blocks from the content for rendering
    const cleanContent = content.replace(/```json\s*[\s\S]*?\s*```/g, '');
    // Emojify markdown content (convert :shortcode: to emoji)
    const emojifiedContent = emoji.emojify(cleanContent);
    
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
          <Textarea 
            placeholder="enter your detailed brief with the client name" 
            value={searchBrief} 
            onChange={onSearchBriefChange} 
            style={{
              lineHeight: '24px'
            }} 
            className="pr-10 min-h-[240px] max-h-[400px] overflow-y-auto resize-none" 
          />
          {searchBrief && (
            <button 
              type="button" 
              onClick={onClear} 
              className="absolute right-3 top-3 text-muted-foreground hover:text-destructive"
            >
              ✕
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
