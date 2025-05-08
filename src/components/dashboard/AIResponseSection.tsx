
import React, { useRef, useEffect, useState, ChangeEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Loader2, Search } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import NeuButton from '@/components/NeuButton';
import NeuCard from '@/components/NeuCard';
import * as emoji from 'node-emoji';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AIResponseSectionProps {
  searchBrief: string;
  searchResults: any;
  searchLoading: boolean;
  onSearchSubmit: (e: React.FormEvent) => void;
  onSearchBriefChange: (e: ChangeEvent<HTMLTextAreaElement>) => void; // Updated to HTMLTextAreaElement
  onClear: () => void;
}

// Helper function to parse tables from response text
const extractTables = (text: string) => {
  // Split the response into sections (assuming tables have headers with "|" characters)
  const sections = text.split(/\n\s*\n/);
  
  const result: { text: string; isTable: boolean; tableData?: any[] }[] = [];
  
  sections.forEach(section => {
    const lines = section.trim().split('\n');
    // Check if this section contains table-like formatting (has | character)
    if (lines.length > 2 && lines[0].includes('|') && lines[1].includes('|-')) {
      // This is likely a markdown table
      const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
      
      const rows = lines.slice(2).map(line => {
        const cells = line.split('|').map(cell => cell.trim()).filter(Boolean);
        return cells.map((cell, i) => {
          // Try to convert to number if it looks like a number (for calculations)
          const numValue = parseFloat(cell.replace(/[$,%₹]/g, ''));
          return {
            raw: cell,
            value: isNaN(numValue) ? cell : numValue,
            isNumber: !isNaN(numValue),
            header: headers[i] || '',
          };
        });
      });
      
      result.push({
        text: section,
        isTable: true,
        tableData: rows
      });
    } else {
      result.push({ text: section, isTable: false });
    }
  });
  
  return result;
};

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
  const [parsedContent, setParsedContent] = useState<{ text: string; isTable: boolean; tableData?: any[] }[]>([]);
  const [editableTables, setEditableTables] = useState<any[][]>([]);
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

  useEffect(() => {
    if (!searchResults) {
      setParsedContent([]);
      setEditableTables([]);
      return;
    }
    
    const content = searchResults.choices?.[0]?.message?.content || '';
    // Emojify markdown content (convert :shortcode: to emoji)
    const emojifiedContent = emoji.emojify(content);
    
    const extracted = extractTables(emojifiedContent);
    setParsedContent(extracted);
    
    // Initialize editable tables with the extracted table data
    const tables = extracted.filter(item => item.isTable).map(item => item.tableData || []);
    setEditableTables(tables);
  }, [searchResults]);

  const handleCellChange = (tableIndex: number, rowIndex: number, cellIndex: number, value: string) => {
    // Make a deep copy of the editable tables
    const newTables = JSON.parse(JSON.stringify(editableTables));
    
    if (!newTables[tableIndex] || !newTables[tableIndex][rowIndex] || !newTables[tableIndex][rowIndex][cellIndex]) {
      console.error("Invalid table cell reference", { tableIndex, rowIndex, cellIndex, tables: newTables });
      return;
    }
    
    // Get the cell being edited
    const cell = newTables[tableIndex][rowIndex][cellIndex];
    const cellHeader = cell.header?.toLowerCase() || '';
    
    // Try to convert input to number if it was a number before
    if (cell.isNumber) {
      // Remove non-numeric characters and convert to number
      const numValue = parseFloat(value.replace(/[$,%₹]/g, ''));
      if (!isNaN(numValue)) {
        // Store the original value for ratio calculations
        const oldValue = cell.value;
        
        // Update cell value
        cell.value = numValue;
        
        // Format with appropriate unit
        if (cellHeader.includes('budget') || cellHeader.includes('cost') || cellHeader.includes('spend') || 
            cellHeader.includes('amount')) {
          cell.raw = `₹${numValue.toLocaleString()}`;
        } else {
          cell.raw = numValue.toString();
        }
        
        // Special handling for Budget Amount - adjust other metrics proportionally
        if (cellHeader.includes('budget') || cellHeader.includes('amount')) {
          const changeRatio = numValue / oldValue;
          
          // Find columns that should be adjusted when budget changes
          for (let colIndex = 0; colIndex < newTables[tableIndex][rowIndex].length; colIndex++) {
            const currentCell = newTables[tableIndex][rowIndex][colIndex];
            const currentHeader = currentCell.header?.toLowerCase() || '';
            
            // Adjust impressions, clicks, etc. based on budget change ratio
            if (colIndex !== cellIndex && currentCell.isNumber && 
                (currentHeader.includes('impressions') || currentHeader.includes('clicks'))) {
                  
              const newCellValue = Math.round(currentCell.value * changeRatio);
              currentCell.value = newCellValue;
              currentCell.raw = newCellValue.toLocaleString();
            }
          }
        }
      }
    } else {
      cell.raw = value;
      cell.value = value;
    }
    
    // Recalculate totals if this table has rows with "Total" in the first cell
    const hasTotal = newTables[tableIndex].some(row => 
      row[0]?.raw?.toLowerCase().includes('total')
    );
    
    if (hasTotal) {
      // Find the total row
      const totalRowIndex = newTables[tableIndex].findIndex(row => 
        row[0]?.raw?.toLowerCase().includes('total')
      );
      
      if (totalRowIndex > -1) {
        // Calculate totals for each column (skip first column which is labels)
        for (let col = 1; col < newTables[tableIndex][0].length; col++) {
          let sum = 0;
          // Sum all rows except the total row
          for (let row = 0; row < newTables[tableIndex].length; row++) {
            if (row !== totalRowIndex && newTables[tableIndex][row][col]?.isNumber) {
              sum += newTables[tableIndex][row][col].value;
            }
          }
          
          // Update the total cell
          if (newTables[tableIndex][totalRowIndex][col]) {
            const cell = newTables[tableIndex][totalRowIndex][col];
            cell.value = sum;
            
            // Preserve formatting ($ or % if present)
            const header = cell.header?.toLowerCase() || '';
            if (header.includes('budget') || header.includes('cost') || header.includes('amount') ||
                cell.raw?.includes('$') || cell.raw?.includes('₹')) {
              cell.raw = `₹${sum.toLocaleString()}`;
            } else if (cell.raw?.includes('%')) {
              cell.raw = `${sum.toFixed(2)}%`;
            } else {
              cell.raw = Math.round(sum).toLocaleString();
            }
          }
        }
      }
    }
    
    setEditableTables(newTables);
  };

  const renderAIResponse = () => {
    if (!searchResults) return null;
    
    return (
      <div className="mt-4">
        <ScrollArea className="h-full max-h-[800px]">
          {parsedContent.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-6">
              {section.isTable ? (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {section.tableData && section.tableData[0]?.map((cell: any, cellIndex: number) => (
                          <TableHead key={cellIndex} className="font-bold">
                            {cell.header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(() => {
                        const tableIndex = parsedContent.slice(0, sectionIndex + 1)
                          .filter(item => item.isTable)
                          .length - 1;
                        
                        if (tableIndex >= 0 && editableTables[tableIndex]) {
                          return editableTables[tableIndex].map((row: any[], rowIndex: number) => {
                            const isTotal = row[0]?.raw?.toLowerCase().includes('total');
                            
                            return (
                              <TableRow key={rowIndex} className={isTotal ? "font-bold bg-muted/20" : ""}>
                                {row.map((cell, cellIndex) => {
                                  // Check if this is a budget cell that should be editable
                                  const isBudgetCell = cell.header?.toLowerCase().includes('budget') || 
                                                    (cell.header?.toLowerCase().includes('amount') && 
                                                      cell.raw?.includes('₹'));
                                  const isEditable = !isTotal && (cellIndex > 0) && 
                                                    (isBudgetCell || cell.isNumber);
                                                    
                                  return (
                                    <TableCell key={cellIndex}>
                                      {isEditable ? (
                                        <Input
                                          value={cell.raw}
                                          onChange={(e) => handleCellChange(tableIndex, rowIndex, cellIndex, e.target.value)}
                                          className={`w-full h-8 p-1 ${isBudgetCell ? 'font-bold bg-blue-50 dark:bg-blue-900/20' : ''} text-right`}
                                        />
                                      ) : (
                                        <span>{cell.raw}</span>
                                      )}
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            );
                          });
                        }
                        return null;
                      })()}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="whitespace-pre-wrap font-mono text-sm">
                  {section.text}
                </div>
              )}
            </div>
          ))}
        </ScrollArea>
      </div>
    );
  };

  return <div>
      <form onSubmit={onSearchSubmit} className="flex gap-2 mb-4">
        <div className="relative flex-grow">
          <Textarea placeholder="enter your detailed brief with the client name" value={searchBrief} onChange={onSearchBriefChange} style={{
          lineHeight: '24px'
        }} className="pr-10 min-h-[240px] max-h-[400px] overflow-y-auto resize-none" />
          {searchBrief && <button type="button" onClick={onClear} className="absolute right-3 top-3 text-muted-foreground hover:text-destructive">
              ✕
            </button>}
        </div>
        <NeuButton type="submit" disabled={searchLoading} className="self-start">
          {searchLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Generate Media Plan
        </NeuButton>
      </form>

      {searchLoading ? <div className="flex flex-col justify-center items-center py-10 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-muted-foreground animate-fade-in">{loaderMessages[loaderMessageIdx]}</span>
        </div> : searchResults ? <NeuCard>
          {renderAIResponse()}
        </NeuCard> : null}
    </div>;
};

export default AIResponseSection;
