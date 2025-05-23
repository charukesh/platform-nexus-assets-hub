
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number according to the Indian number system (lakhs, crores)
 * @param value - The number to format
 * @returns Formatted string with commas as per Indian number system
 */
export function formatIndianNumber(value: number | string): string {
  if (value === null || value === undefined) return '';
  
  // Convert to number if it's a string
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
  
  if (isNaN(num)) return String(value);
  
  // Convert to string and split into integer and decimal parts
  const [integerPart, decimalPart] = num.toString().split('.');
  
  // Format integer part with Indian numbering system
  let formattedInteger = '';
  const integerStr = integerPart.toString();
  
  // Handle negative numbers
  const isNegative = integerStr.startsWith('-');
  const absIntegerStr = isNegative ? integerStr.substring(1) : integerStr;
  
  // Apply Indian number system formatting
  const length = absIntegerStr.length;
  
  if (length <= 3) {
    formattedInteger = absIntegerStr;
  } else {
    // Add comma after first 3 digits from right
    formattedInteger = absIntegerStr.substring(length - 3);
    
    // Then add commas after every 2 digits
    let remaining = absIntegerStr.substring(0, length - 3);
    while (remaining.length > 0) {
      const chunk = remaining.substring(Math.max(0, remaining.length - 2));
      formattedInteger = chunk + (formattedInteger ? ',' + formattedInteger : formattedInteger);
      remaining = remaining.substring(0, Math.max(0, remaining.length - 2));
    }
  }
  
  // Add negative sign if needed
  if (isNegative) {
    formattedInteger = '-' + formattedInteger;
  }
  
  // Combine with decimal part if it exists
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
}

/**
 * Escapes a string for use in a CSV file
 * @param value - The string to escape
 * @returns Escaped string safe for CSV
 */
export function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) return '';
  
  const stringValue = String(value);
  
  // If the value contains quotes, commas, or newlines, wrap in quotes and escape inner quotes
  if (stringValue.includes('"') || stringValue.includes(',') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Converts an object to a CSV row
 * @param obj - The object to convert
 * @param headers - Array of header keys in the desired order
 * @returns CSV row string
 */
export function objectToCsvRow(obj: any, headers: string[]): string {
  return headers.map(header => escapeCsvValue(obj[header])).join(',');
}

/**
 * Creates a CSV string from an array of objects
 * @param data - Array of objects to convert
 * @param headers - Object mapping header keys to display names
 * @returns Full CSV string with headers
 */
export function createCsv(data: any[], headers: {[key: string]: string}): string {
  const headerKeys = Object.keys(headers);
  const headerRow = headerKeys.map(key => escapeCsvValue(headers[key])).join(',');
  
  const rows = data.map(item => objectToCsvRow(item, headerKeys));
  
  return [headerRow, ...rows].join('\n');
}

/**
 * Initiates download of a CSV file in the browser
 * @param csvContent - CSV string content
 * @param fileName - Name for the downloaded file
 */
export function downloadCsv(csvContent: string, fileName: string = 'export.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  // Add to document, trigger download, and clean up
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Release the URL object
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Formats and converts AI search results to CSV format
 * @param searchResults - The AI search response data
 * @returns CSV string of the formatted data
 */
export function formatSearchResultsToCsv(searchResults: any): string {
  if (!searchResults || !searchResults.choices || !searchResults.choices[0]?.message?.content) {
    return 'No valid data available for export';
  }

  const content = searchResults.choices[0].message.content;
  let csvData = [];
  
  // Add brief summary
  csvData.push(['Brief Summary']);
  csvData.push([content.briefSummary || '']);
  csvData.push([]);  // Empty line for separation
  
  // Process each plan option
  if (content.options) {
    Object.entries(content.options).forEach(([key, option]: [string, any], index) => {
      // Add plan header
      csvData.push([`Plan ${index + 1}: ${option.planName}`]);
      csvData.push([`Total Budget: ₹${option.totalBudget}`, `Budget Percentage: ${option.budgetPercentage}`]);
      csvData.push([]);
      
      // Add assets table headers
      if (option.assets && option.assets.length > 0) {
        csvData.push([
          'Asset Name',
          'Platform',
          'Industry',
          'Buy Type',
          'Base Cost',
          'Estimated Clicks',
          'Estimated Impressions',
          'Budget Percent',
          'Budget Amount',
          'Geographic Targeting',
          'Device Targeting'
        ]);
        
        // Add asset rows
        option.assets.forEach((asset: any) => {
          const estimates = calculateEstimates(asset);
          
          csvData.push([
            asset.assetName || '',
            asset.platform || '',
            asset.industry || '',
            asset.buyType || '',
            asset.baseCost || '',
            estimates.estimatedClicks || '',
            estimates.estimatedImpressions || '',
            `${asset.budgetPercent || ''}%`,
            `₹${asset.budgetAmount || ''}`,
            asset.targeting?.geographic || '',
            asset.targeting?.deviceSplit || ''
          ]);
        });
        
        csvData.push([]);  // Empty line for separation
      }
    });
  }
  
  // Add recommendation
  if (content.recommendation) {
    csvData.push(['Recommendation']);
    csvData.push([content.recommendation]);
    csvData.push([]);
  }
  
  // Add next steps
  if (content.nextSteps && content.nextSteps.length > 0) {
    csvData.push(['Next Steps']);
    content.nextSteps.forEach((step: string, index: number) => {
      csvData.push([`${index + 1}. ${step}`]);
    });
  }
  
  // Convert to CSV string
  return csvData.map(row => row.map(cell => escapeCsvValue(cell)).join(',')).join('\n');
}

// Helper function to calculate estimates
function calculateEstimates(asset: any) {
  const budgetAmount = parseFloat(asset.budgetAmount);
  const baseCost = parseFloat(asset.baseCost);
  
  if (isNaN(budgetAmount) || isNaN(baseCost) || baseCost === 0) {
    return { estimatedClicks: "N/A", estimatedImpressions: "N/A" };
  }
  
  const buyType = asset.buyType?.toLowerCase() || "";
  
  if (buyType.includes("click")) {
    // Cost Per Click (CPC) - calculate clicks directly
    const clicks = Math.round(budgetAmount / baseCost);
    return { 
      estimatedClicks: formatIndianNumber(clicks), 
      estimatedImpressions: "N/A" 
    };
  } else if (buyType.includes("mille")) {
    // Cost Per Mille (CPM) - calculate impressions then derive clicks
    const impressions = Math.round((budgetAmount / baseCost) * 1000);
    return { 
      estimatedClicks: "N/A", 
      estimatedImpressions: formatIndianNumber(impressions) 
    };
  }
  
  // Default if buyType is not recognized
  return { 
    estimatedClicks: asset.estimatedClicks || "N/A", 
    estimatedImpressions: asset.estimatedImpressions || "N/A" 
  };
}

