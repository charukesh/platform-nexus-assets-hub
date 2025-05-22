
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
