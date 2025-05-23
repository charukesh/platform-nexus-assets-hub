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
 * Formats and converts AI search results to CSV format
 * @param searchResults - The AI search response data
 * @returns CSV string of the formatted data
 */
export function formatSearchResultsToCsv(searchResults: any): string {
  if (!searchResults || !searchResults.choices || !searchResults.choices[0]?.message?.content) {
    return 'No valid data available for export';
  }

  const content = searchResults.choices[0].message.content;
  const rows = [];
  
  // Add brief summary as header
  rows.push(['Brief Summary']);
  rows.push([content.briefSummary || '']);
  rows.push([]); // Empty row for separation
  
  // Process each plan option
  if (content.options) {
    Object.entries(content.options).forEach(([key, option]: [string, any]) => {
      // Add plan header and total budget
      rows.push([`Plan: ${option.planName}`]);
      rows.push([`Total Budget: ₹${option.totalBudget}`]);
      rows.push([]);
      
      // Add table headers for assets
      const headers = [
        'Asset Name', 
        'Platform', 
        'Industry', 
        'Buy Type', 
        'Base Cost', 
        'Estimated Clicks', 
        'Estimated Impressions',
        'CTR (%)', 
        'Budget Percent', 
        'Budget Amount', 
        'Geographic Targeting', 
        'Device Targeting'
      ];
      
      rows.push(headers);
      
      // Add asset rows
      if (option.assets && option.assets.length > 0) {
        option.assets.forEach((asset: any) => {
          rows.push([
            asset.assetName || '',
            asset.platform || '',
            asset.industry || '',
            asset.buyType || '',
            asset.baseCost || '',
            asset.estimatedClicks || '',
            asset.estimatedImpressions || '',
            asset.ctr || '16%',
            `${asset.budgetPercent || ''}%`,
            asset.budgetAmount || '',
            asset.targeting?.geographic || '',
            asset.targeting?.deviceSplit || ''
          ]);
        });
      }
      
      rows.push([]); // Empty row for separation between plans
    });
  }
  
  // Add recommendation if exists
  if (content.recommendation) {
    rows.push(['Recommendation']);
    rows.push([content.recommendation]);
    rows.push([]);
  }
  
  // Add next steps if exists
  if (content.nextSteps && content.nextSteps.length > 0) {
    rows.push(['Next Steps']);
    content.nextSteps.forEach((step: string, index: number) => {
      rows.push([`${index + 1}. ${step}`]);
    });
  }
  
  // Convert 2D array to CSV
  return rows.map(row => 
    row.map(cell => escapeCsvValue(cell)).join(',')
  ).join('\n');
}

/**
 * Initiates download of a CSV file in the browser
 * @param csvContent - CSV string content
 * @param fileName - Name for the downloaded file
 */
export function downloadCsv(csvContent: string, fileName: string = 'export.csv'): void {
  // Create a blob with UTF-8 BOM to ensure Excel recognizes the encoding correctly
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a temporary link element
  const link = document.createElement('a');
  
  // Use URL.createObjectURL to create a temporary URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Set link properties
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  
  // Add to document, trigger download, and clean up
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Release the URL object after a short delay to ensure download starts
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Open the search results in Google Sheets
 * @param searchResults - The AI search response data
 */
export function exportToGoogleSheets(searchResults: any): void {
  if (!searchResults || !searchResults.choices || !searchResults.choices[0]?.message?.content) {
    console.error('No valid data available for export to Google Sheets');
    return;
  }

  try {
    const content = searchResults.choices[0].message.content;
    let csvData = '';
    
    // Add brief summary
    csvData += encodeURIComponent('Brief Summary\n');
    csvData += encodeURIComponent(content.briefSummary || '') + encodeURIComponent('\n\n');
    
    // Process each plan option
    if (content.options) {
      Object.entries(content.options).forEach(([key, option]: [string, any]) => {
        csvData += encodeURIComponent(`Plan: ${option.planName}\n`);
        csvData += encodeURIComponent(`Total Budget: ₹${option.totalBudget}\n\n`);
        
        // Add table headers for assets
        csvData += encodeURIComponent('Asset Name,Platform,Industry,Buy Type,Base Cost,Estimated Clicks,Estimated Impressions,CTR (%),Budget Percent,Budget Amount,Geographic Targeting,Device Targeting\n');
        
        // Add asset rows
        if (option.assets && option.assets.length > 0) {
          option.assets.forEach((asset: any) => {
            csvData += encodeURIComponent([
              asset.assetName || '',
              asset.platform || '',
              asset.industry || '',
              asset.buyType || '',
              asset.baseCost || '',
              asset.estimatedClicks || '',
              asset.estimatedImpressions || '',
              asset.ctr || '16%',
              `${asset.budgetPercent || ''}%`,
              asset.budgetAmount || '',
              asset.targeting?.geographic || '',
              asset.targeting?.deviceSplit || ''
            ].join(',')) + encodeURIComponent('\n');
          });
        }
        
        csvData += encodeURIComponent('\n');
      });
    }
    
    // Add recommendation if exists
    if (content.recommendation) {
      csvData += encodeURIComponent('Recommendation\n');
      csvData += encodeURIComponent(content.recommendation) + encodeURIComponent('\n\n');
    }
    
    // Add next steps if exists
    if (content.nextSteps && content.nextSteps.length > 0) {
      csvData += encodeURIComponent('Next Steps\n');
      content.nextSteps.forEach((step: string, index: number) => {
        csvData += encodeURIComponent(`${index + 1}. ${step}\n`);
      });
    }

    // Create Google Sheets URL with the data
    const baseUrl = 'https://docs.google.com/spreadsheets/d/1/edit#gid=0&headers=1&range=A1';
    const fullUrl = `https://docs.google.com/spreadsheets/create?usp=sheets_api&data=${csvData}`;
    
    // Open Google Sheets in a new tab
    window.open(fullUrl, '_blank');
  } catch (error) {
    console.error('Error exporting to Google Sheets:', error);
    throw error;
  }
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
