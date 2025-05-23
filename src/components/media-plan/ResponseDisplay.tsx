
import React, { useState, useMemo } from "react";
import NeuCard from "@/components/NeuCard";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Edit, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatIndianNumber } from "@/lib/utils";

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
    planType?: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  
  // Parse and prepare the table data
  const tableData = useMemo(() => {
    try {
      if (!response) return { flatData: [], hasNestedPlans: false };
      
      // Check if response is a string and try to parse it
      const data = typeof response === 'string' ? JSON.parse(response) : response;
      
      // Check if we have a nested structure with plans
      if (data && typeof data === 'object') {
        // Handle case where we have nested plans object structure
        if (data.plans && typeof data.plans === 'object') {
          const planTypes = Object.keys(data.plans);
          const hasNestedPlans = planTypes.length > 0;
          
          if (hasNestedPlans) {
            // We have a nested plan structure
            const plansData: Record<string, MediaPlanItem[]> = {};
            
            // Process each plan
            planTypes.forEach(planType => {
              const plan = data.plans[planType];
              if (plan && plan.assets && Array.isArray(plan.assets)) {
                // Use asset's CTR if available, otherwise default to 0.5% (0.5)
                plansData[planType] = plan.assets.map(asset => {
                  // Get CTR value from asset or use default
                  const ctrValue = asset.ctr !== undefined ? asset.ctr : 0.5;
                  
                  const processedAsset = {
                    ...asset,
                    totalBudget: plan.totalBudget,
                    planTitle: plan.title,
                    ctr: ctrValue
                  };
                  
                  // Fill in missing values based on CTR
                  if (processedAsset.estimatedClicks === undefined || processedAsset.estimatedClicks === "N/A") {
                    if (processedAsset.estimatedImpressions && processedAsset.estimatedImpressions !== "N/A") {
                      const impressions = parseInt(String(processedAsset.estimatedImpressions).replace(/,/g, ''));
                      if (!isNaN(impressions)) {
                        processedAsset.estimatedClicks = Math.round(impressions * processedAsset.ctr / 100);
                      }
                    }
                  } 
                  else if (processedAsset.estimatedImpressions === undefined || processedAsset.estimatedImpressions === "N/A") {
                    if (processedAsset.estimatedClicks && processedAsset.estimatedClicks !== "N/A") {
                      const clicks = parseInt(String(processedAsset.estimatedClicks).replace(/,/g, ''));
                      if (!isNaN(clicks)) {
                        processedAsset.estimatedImpressions = Math.round(clicks * 100 / processedAsset.ctr);
                      }
                    }
                  }
                  
                  return processedAsset;
                });
              }
            });
            
            return { 
              flatData: [], 
              hasNestedPlans: true, 
              plansData,
              recommendations: data.recommendation,
              nextSteps: data.nextSteps
            };
          }
        }
        
        // Handle array response
        if (Array.isArray(data)) {
          // Use item's CTR if available or default to 0.5%
          return { 
            flatData: data.map(item => ({
              ...item,
              ctr: item.ctr !== undefined ? item.ctr : 0.5
            })), 
            hasNestedPlans: false 
          };
        }
        
        // Handle case where response is mediaPlan array
        if (data.mediaPlan && Array.isArray(data.mediaPlan)) {
          // Use item's CTR if available or default to 0.5%
          return { 
            flatData: data.mediaPlan.map(item => {
              // Get CTR value or use default
              const ctrValue = item.ctr !== undefined ? item.ctr : 0.5;
              
              const processedItem = {
                ...item,
                ctr: ctrValue
              };
              
              // Fill in missing values based on CTR
              if (processedItem.clicks === undefined || processedItem.clicks === "N/A") {
                if (processedItem.impressions && processedItem.impressions !== "N/A") {
                  const impressions = parseInt(String(processedItem.impressions).replace(/,/g, ''));
                  if (!isNaN(impressions)) {
                    processedItem.clicks = Math.round(impressions * processedItem.ctr / 100);
                  }
                }
              } 
              else if (processedItem.impressions === undefined || processedItem.impressions === "N/A") {
                if (processedItem.clicks && processedItem.clicks !== "N/A") {
                  const clicks = parseInt(String(processedItem.clicks).replace(/,/g, ''));
                  if (!isNaN(clicks)) {
                    processedItem.impressions = Math.round(clicks * 100 / processedItem.ctr);
                  }
                }
              }
              
              return processedItem;
            }), 
            hasNestedPlans: false 
          };
        }
      }
      
      // Default empty result
      return { flatData: [], hasNestedPlans: false };
    } catch (error) {
      console.error("Failed to parse response data:", error);
      return { flatData: [], hasNestedPlans: false };
    }
  }, [response]);

  if (!response) return null;

  const startEditing = (rowIndex: number, columnKey: string, value: any, planType?: string) => {
    setEditingCell({ rowIndex, columnKey, planType });
    setEditValue(String(value || ""));
  };

  const saveEditedValue = () => {
    if (editingCell) {
      const { rowIndex, columnKey, planType } = editingCell;
      
      let updatedData: MediaPlanItem[];
      
      if (planType && tableData.hasNestedPlans && tableData.plansData) {
        updatedData = [...tableData.plansData[planType]];
        const originalValue = Number(updatedData[rowIndex][columnKey]);
        const newValue = Number(editValue);
        
        if (columnKey === "budgetAmount" && !isNaN(newValue) && !isNaN(originalValue)) {
          // Calculate the ratio between new and old budget
          const ratio = newValue / originalValue;
          
          // Update budget
          updatedData[rowIndex][columnKey] = newValue;
          
          // Update related metrics proportionally
          if (updatedData[rowIndex].estimatedImpressions !== undefined) {
            updatedData[rowIndex].estimatedImpressions = Math.round(Number(updatedData[rowIndex].estimatedImpressions) * ratio);
          }
          
          if (updatedData[rowIndex].estimatedClicks !== undefined) {
            updatedData[rowIndex].estimatedClicks = Math.round(Number(updatedData[rowIndex].estimatedClicks) * ratio);
          }
          
          // Update the total budget for this plan
          if (tableData.plansData[planType][0].totalBudget) {
            const oldTotal = Number(tableData.plansData[planType][0].totalBudget);
            const budgetDiff = newValue - originalValue;
            tableData.plansData[planType].forEach(item => {
              item.totalBudget = oldTotal + budgetDiff;
            });
          }
        } else {
          // For non-budget fields, just update the value
          updatedData[rowIndex][columnKey] = editValue;
        }
      } else {
        updatedData = [...tableData.flatData];
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
          if (updatedData[rowIndex].clicks !== undefined && Number(updatedData[rowIndex].clicks) > 0) {
            if (updatedData[rowIndex].cpc !== undefined) {
              updatedData[rowIndex].cpc = newValue / Number(updatedData[rowIndex].clicks);
            }
            
            if (updatedData[rowIndex].impressions !== undefined && updatedData[rowIndex].ctr !== undefined) {
              const impressions = Number(updatedData[rowIndex].impressions);
              if (impressions > 0) {
                updatedData[rowIndex].ctr = Number(updatedData[rowIndex].clicks) / impressions * 100;
              }
            }
          }
        } else {
          // For non-budget fields, just update the value
          updatedData[rowIndex][columnKey] = editValue;
        }
      }
      
      setEditingCell(null);
    }
  };

  const cancelEditing = () => {
    setEditingCell(null);
  };

  const formatValue = (value: any, key: string): string => {
    if (value === undefined || value === null) return "-";
    
    // Handle different types of values based on key
    if (key === "budget" || key === "budgetAmount" || key.toLowerCase().includes("budget")) {
      if (typeof value === "number") {
        return `₹${formatIndianNumber(value)}`;
      }
      if (typeof value === "string") {
        return value.toString().startsWith("$") || value.toString().startsWith("₹") 
          ? value.toString().replace("$", "₹") 
          : `₹${formatIndianNumber(value)}`;
      }
      return `₹${formatIndianNumber(value)}`;
    }
    
    if (key === "ctr" || key === "conversionRate" || key === "ctrPercentage" || 
        key.toLowerCase().includes("rate") || key.toLowerCase().includes("percentage")) {
      if (value === null) return "-";
      const numValue = typeof value === "number" ? value : parseFloat(String(value));
      if (!isNaN(numValue)) {
        // If it's already in percentage format (e.g., 2 instead of 0.02)
        if (numValue > 1) {
          return `${numValue.toFixed(2)}%`;
        }
        // Convert from decimal to percentage (e.g., 0.05 to 5%)
        return `${(numValue * 100).toFixed(2)}%`;
      }
      return typeof value === "string" && value.endsWith("%") ? value : `${value}%`;
    }
    
    if (key === "impressions" || key === "clicks" || key === "conversions" || 
        key === "estimatedImpressions" || key === "estimatedClicks" || 
        key.toLowerCase().includes("impressions") || key.toLowerCase().includes("clicks")) {
      if (value === null) return "-";
      const numValue = typeof value === "number" ? value : parseFloat(String(value));
      if (!isNaN(numValue)) {
        return formatIndianNumber(numValue);
      }
      return String(value);
    }
    
    if (key === "cpc" || key === "cpa" || key === "baseCost" || key.toLowerCase().includes("cost")) {
      if (value === null) return "-";
      const numValue = typeof value === "number" ? value : parseFloat(String(value));
      if (!isNaN(numValue)) {
        return `₹${numValue.toFixed(2)}`;
      }
      return typeof value === "string" && (value.startsWith("$") || value.startsWith("₹")) 
        ? value.toString().replace("$", "₹") 
        : `₹${value}`;
    }
    
    // Default string conversion
    return String(value);
  };

  const isEditableColumn = (key: string): boolean => {
    return key === "budget" || 
           key === "budgetAmount" ||
           key.toLowerCase().includes("budget") || 
           key.toLowerCase().includes("spend") || 
           key.toLowerCase().includes("cost");
  };

  // Render a single table with the data
  const renderTable = (data: MediaPlanItem[], title?: string, showTotals: boolean = true) => {
    if (!data || data.length === 0) return null;
    
    // Extract headers from the data, filtering out any internal or complex nested structures
    const allKeys = data.flatMap(item => Object.keys(item));
    const uniqueKeys = Array.from(new Set(allKeys));
    
    // Filter and prioritize headers
    const priorityKeys = [
      "platform", "assetName", "format", "budgetAmount", "budget", "baseCost",
      "estimatedClicks", "estimatedImpressions", "clicks", "impressions",
      "ctr", "ctrPercentage", "cpc"
    ];
    
    // Sort headers to put important fields first, filter out nested objects and arrays
    const sortedHeaders = [
      ...priorityKeys.filter(key => uniqueKeys.includes(key)),
      ...uniqueKeys.filter(key => 
        !priorityKeys.includes(key) && 
        typeof data[0][key] !== 'object' &&
        !Array.isArray(data[0][key]) &&
        key !== 'insights' && 
        key !== 'strategicEssence' &&
        key !== 'planTitle' &&
        key !== 'totalBudget' &&
        key !== 'budgetPercent' // Remove the budget percent column
      )
    ];
    
    // Calculate totals for numeric columns
    const totals: { [key: string]: number } = {};
    
    if (showTotals) {
      sortedHeaders.forEach(header => {
        const values = data.map(item => {
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
    }

    return (
      <div className="mb-8">
        {title && <h3 className="text-xl font-bold mb-3">{title}</h3>}
        <Table>
          <TableHeader>
            <TableRow>
              {sortedHeaders.map((header) => (
                <TableHead key={header} className="font-semibold capitalize">
                  {typeof header === 'string' 
                    ? header.replace(/([A-Z])/g, " $1").charAt(0).toUpperCase() + header.replace(/([A-Z])/g, " $1").slice(1) 
                    : String(header)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, rowIndex) => (
              <TableRow key={rowIndex} className="group">
                {sortedHeaders.map((key) => (
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
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditedValue();
                            if (e.key === 'Escape') cancelEditing();
                          }}
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
                        <span>{formatValue(row[key], key)}</span>
                        {isEditableColumn(key) && (
                          <button 
                            onClick={() => startEditing(rowIndex, key, row[key], title)} 
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
            {showTotals && Object.keys(totals).length > 0 && (
              <TableRow className="border-t-2 font-semibold">
                {sortedHeaders.map((header) => (
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

  // Render additional information like insights
  const renderAssetInsights = (data: MediaPlanItem[]) => {
    const assetsWithInsights = data.filter(asset => 
      asset.insights && Array.isArray(asset.insights) && asset.insights.length > 0);
    
    if (assetsWithInsights.length === 0) return null;
    
    return (
      <div className="mt-6 space-y-6">
        <h3 className="text-xl font-bold">Platform Insights</h3>
        {assetsWithInsights.map((asset, index) => (
          <div key={index} className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-bold text-lg mb-2">
              {asset.platform || "Platform"} {asset.assetName ? `- ${asset.assetName}` : ""}
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              {asset.insights.map((insight: string, i: number) => (
                <li key={i}>{insight}</li>
              ))}
            </ul>
            {asset.strategicEssence && (
              <p className="mt-3 font-medium text-primary">
                Strategic Essence: {asset.strategicEssence}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Render recommendations
  const renderRecommendations = (recommendations?: string, nextSteps?: string[]) => {
    if (!recommendations && (!nextSteps || nextSteps.length === 0)) return null;
    
    return (
      <div className="mt-8">
        {recommendations && (
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">Recommendation</h3>
            <p className="text-gray-700">{recommendations}</p>
          </div>
        )}
        
        {nextSteps && nextSteps.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-2">Next Steps</h3>
            <ul className="list-disc pl-5 space-y-1">
              {nextSteps.map((step, i) => (
                <li key={i} className="text-gray-700">{step}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Main render
  return (
    <NeuCard className="prose max-w-none overflow-x-auto">
      <div className="mb-4">
        <h3 className="text-xl font-bold">Media Plan</h3>
        <p className="text-muted-foreground text-sm">
          Edit budget values to see how it affects impressions and clicks
        </p>
      </div>
      
      {tableData.hasNestedPlans && tableData.plansData ? (
        <Tabs defaultValue={Object.keys(tableData.plansData)[0]} className="w-full">
          <TabsList className="mb-4">
            {Object.keys(tableData.plansData).map(planKey => (
              <TabsTrigger key={planKey} value={planKey} className="capitalize">
                {planKey.replace(/([A-Z])/g, " $1")}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.entries(tableData.plansData).map(([planKey, planData]) => (
            <TabsContent key={planKey} value={planKey}>
              {renderTable(planData, planData[0]?.planTitle || planKey)}
              {renderAssetInsights(planData)}
            </TabsContent>
          ))}
          
          {tableData.recommendations && (
            <div className="mt-6 border-t pt-4">
              {renderRecommendations(tableData.recommendations, tableData.nextSteps)}
            </div>
          )}
        </Tabs>
      ) : (
        renderTable(tableData.flatData)
      )}
    </NeuCard>
  );
};

export default ResponseDisplay;
