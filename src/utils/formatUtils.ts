
import { format } from "date-fns";

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-IN").format(num);
};

export const formatUserCount = (count: string | number | null | undefined): string => {
  if (!count) return "N/A";
  
  const numValue = typeof count === 'string' ? parseInt(count.replace(/,/g, ''), 10) : count;
  if (isNaN(Number(numValue))) return "N/A";
  
  return `${Math.round(Number(numValue) / 1000000)}M`;
};

export const formatDate = (date: Date) => {
  return format(date, "MMMM d, yyyy");
};
