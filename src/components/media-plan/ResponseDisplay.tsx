
import React, { useState, useEffect } from "react";
import NeuCard from "@/components/NeuCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface ResponseDisplayProps {
  response: string;
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
          const numValue = parseFloat(cell.replace(/[$,%]/g, ''));
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

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response }) => {
  const [parsedContent, setParsedContent] = useState<{ text: string; isTable: boolean; tableData?: any[] }[]>([]);
  const [editableTables, setEditableTables] = useState<any[][]>([]);

  useEffect(() => {
    if (!response) {
      setParsedContent([]);
      setEditableTables([]);
      return;
    }

    const extracted = extractTables(response);
    setParsedContent(extracted);
    
    // Initialize editable tables with the extracted table data
    const tables = extracted.filter(item => item.isTable).map(item => item.tableData || []);
    setEditableTables(tables);
  }, [response]);

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
      const numValue = parseFloat(value.replace(/[$,%]/g, ''));
      if (!isNaN(numValue)) {
        // Store the original value for ratio calculations
        const oldValue = cell.value;
        
        // Update cell value
        cell.value = numValue;
        
        // Format with appropriate unit
        if (cellHeader.includes('budget') || cellHeader.includes('cost') || cellHeader.includes('spend') || 
            cellHeader.includes('amount')) {
          cell.raw = `$${numValue.toFixed(2)}`;
        } else {
          cell.raw = numValue.toString();
        }
        
        // Special handling for Budget Amount - adjust other metrics proportionally
        if (cellHeader.includes('budget amount') || cellHeader.includes('amount')) {
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
              currentCell.raw = newCellValue.toString();
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
                cell.raw?.includes('$')) {
              cell.raw = `$${sum.toFixed(2)}`;
            } else if (cell.raw?.includes('%')) {
              cell.raw = `${sum.toFixed(2)}%`;
            } else {
              cell.raw = Math.round(sum).toString();
            }
          }
        }
      }
    }
    
    setEditableTables(newTables);
  };

  if (!response) return null;

  return (
    <NeuCard className="prose max-w-none">
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
                                const isBudgetCell = cell.header?.toLowerCase().includes('budget amount') || 
                                                   (cell.header?.toLowerCase().includes('amount') && 
                                                    cell.raw?.includes('$'));
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
    </NeuCard>
  );
};

export default ResponseDisplay;
