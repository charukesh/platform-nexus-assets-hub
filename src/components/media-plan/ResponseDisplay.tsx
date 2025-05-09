
import React, { useState } from "react";
import NeuCard from "@/components/NeuCard";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Edit, Check } from "lucide-react";
import { Input } from "@/components/ui/input";

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

interface ResponseDisplayProps {
  response: any;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response }) => {
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    columnKey: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [tableData, setTableData] = useState<MediaPlanItem[]>(() => {
    if (Array.isArray(response)) {
      return response;
    } else if (typeof response === 'object' && response !== null) {
      // Handle case where response is a single media plan object or has a different structure
      if (response.mediaPlanItems && Array.isArray(response.mediaPlanItems)) {
        return response.mediaPlanItems;
      } else {
        // Convert object to array if needed
        return Object.entries(response).map(([key, value]) => {
          if (typeof value === 'object' && value !== null) {
            return { platform: key, ...value };
          }
          return { key, value };
        });
      }
    }
    return [];
  });

  if (!response) return null;

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
           key.toLowerCase().includes("cost");
  };

  // Extract headers from the data
  const headers = tableData.length > 0 
    ? Object.keys(tableData[0]).filter(key => key !== 'id' && key !== 'key')
    : [];

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
            {headers.map(header => (
              <TableHead key={header} className="font-semibold capitalize">
                {header.replace(/([A-Z])/g, " $1").trim()}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
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
                      {formatValue(row[key], key)}
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
    </NeuCard>
  );
};

export default ResponseDisplay;
