
import React, { useState, useMemo } from "react";
import NeuCard from "@/components/NeuCard";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Edit, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MediaPlanItem {
  [key: string]: any;
}

interface ResponseDisplayProps {
  response: any;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response }) => {
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    columnKey: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  
  // Parse and prepare the table data
  const tableData = useMemo(() => {
    if (Array.isArray(response)) {
      return response as MediaPlanItem[];
    } else if (typeof response === 'object' && response !== null) {
      // Handle case where response is a single media plan object or has a different structure
      if (response.mediaPlan && Array.isArray(response.mediaPlan)) {
        return response.mediaPlan as MediaPlanItem[];
      } else {
        // Convert object to array if needed
        return Object.entries(response).map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            return { ...value, key } as MediaPlanItem;
          }
          return { key, value } as MediaPlanItem;
        });
      }
    }
    return [] as MediaPlanItem[];
  }, [response]);

  if (!response || tableData.length === 0) return null;

  // Get all unique keys from all objects in the array
  const headers = Array.from(
    new Set(
      tableData.flatMap(item => Object.keys(item))
    )
  ).filter(key => key !== 'id' && key !== 'key');

  // Sort headers to put important fields first
  const sortedHeaders = [
    'platform',
    'format',
    'budget',
    ...headers.filter(h => !['platform', 'format', 'budget'].includes(h))
  ].filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

  const startEditing = (rowIndex: number, columnKey: string, value: any) => {
    setEditingCell({ rowIndex, columnKey });
    setEditValue(String(value || ""));
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
        
        // Recalculate CPC and CTR if they exist
        if (updatedData[rowIndex].clicks !== undefined) {
          const clicks = Number(updatedData[rowIndex].clicks);
          if (clicks > 0 && updatedData[rowIndex].cpc !== undefined) {
            updatedData[rowIndex].cpc = newValue / clicks;
          }
          
          if (updatedData[rowIndex].impressions !== undefined && updatedData[rowIndex].ctr !== undefined) {
            const impressions = Number(updatedData[rowIndex].impressions);
            if (impressions > 0) {
              updatedData[rowIndex].ctr = clicks / impressions;
            }
          }
        }
      } else {
        // For non-budget fields, just update the value
        updatedData[rowIndex][columnKey] = editValue;
      }
      
      // Update the parent component with the new data
      if (Array.isArray(response)) {
        response.splice(0, response.length, ...updatedData);
      } else if (response.mediaPlan) {
        response.mediaPlan = updatedData;
      }
      
      setEditingCell(null);
    }
  };

  const cancelEditing = () => {
    setEditingCell(null);
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
    
    if (key === "ctr" || key === "conversionRate" || key.toLowerCase().includes("rate")) {
      const numValue = typeof value === "number" ? value : parseFloat(String(value));
      if (!isNaN(numValue)) {
        // If it's already in percentage format (e.g., 2 instead of 0.02)
        if (numValue > 1) {
          return `${numValue.toFixed(2)}%`;
        }
        // Convert from decimal to percentage (e.g., 0.05 to 5%)
        return `${(numValue * 100).toFixed(2)}%`;
      }
      return value.toString().endsWith("%") ? value.toString() : `${value}%`;
    }
    
    if (key === "impressions" || key === "clicks" || key === "conversions" || 
        key.toLowerCase().includes("impressions") || key.toLowerCase().includes("clicks")) {
      const numValue = typeof value === "number" ? value : parseFloat(String(value));
      if (!isNaN(numValue)) {
        return numValue.toLocaleString();
      }
      return value.toString();
    }
    
    if (key === "cpc" || key === "cpa" || key.toLowerCase().includes("cost")) {
      const numValue = typeof value === "number" ? value : parseFloat(String(value));
      if (!isNaN(numValue)) {
        return `$${numValue.toFixed(2)}`;
      }
      return value.toString().startsWith("$") ? value.toString() : `$${value}`;
    }
    
    return value.toString();
  };

  const isEditableColumn = (key: string): boolean => {
    return key === "budget" || 
           key.toLowerCase().includes("budget") || 
           key.toLowerCase().includes("spend") || 
           key.toLowerCase().includes("cost");
  };

  // Calculate totals for numeric columns
  const totals: { [key: string]: number } = {};
  sortedHeaders.forEach(header => {
    const values = tableData.map(item => {
      const rawValue = item[header];
      if (typeof rawValue === "number") return rawValue;
      if (typeof rawValue === "string") {
        // Remove any non-numeric characters except decimal point
        const cleanValue = rawValue.replace(/[^0-9.]/g, "");
        return parseFloat(cleanValue);
      }
      return NaN;
    });
    
    const validValues = values.filter(v => !isNaN(v));
    if (validValues.length > 0) {
      totals[header] = validValues.reduce((sum, val) => sum + val, 0);
    }
  });

  return (
    <NeuCard className="prose max-w-none overflow-x-auto">
      <div className="mb-4">
        <h3 className="text-xl font-bold">Media Plan</h3>
        <p className="text-muted-foreground text-sm">
          Edit budget values to see how it affects impressions and clicks
        </p>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            {sortedHeaders.map((header) => (
              <TableHead key={String(header)} className="font-semibold capitalize">
                {typeof header === 'string' ? header.replace(/([A-Z])/g, " $1").trim() : String(header)}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="group">
              {sortedHeaders.map((key) => (
                <TableCell key={String(key)} className="align-middle">
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
                        className="ml-1 p-1 hover:bg-gray-100 rounded"
                        aria-label="Save"
                      >
                        <Check size={16} />
                      </button>
                      <button 
                        onClick={cancelEditing} 
                        className="ml-1 p-1 hover:bg-gray-100 rounded"
                        aria-label="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <span>{formatValue(row[String(key)], String(key))}</span>
                      {isEditableColumn(String(key)) && (
                        <button 
                          onClick={() => startEditing(rowIndex, String(key), row[String(key)])} 
                          className="ml-2 p-1 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 focus:opacity-100"
                          aria-label="Edit value"
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
              {sortedHeaders.map((header) => (
                <TableCell key={`total-${String(header)}`}>
                  {totals[String(header)] !== undefined 
                    ? formatValue(totals[String(header)], String(header))
                    : ""}
                </TableCell>
              ))}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </NeuCard>
  );
};

export default ResponseDisplay;
