
import { Json } from "@/integrations/supabase/types";
import { CampaignData, Platform } from "@/types/campaign";
import { supabase } from "@/integrations/supabase/client";
import { enhancePlatform } from "@/utils/campaignUtils";

// Use export type for re-exporting types when isolatedModules is enabled
export type { Platform };

// Type guard to check if a Json value is an object
export function isJsonObject(value: Json | null | undefined): value is { [key: string]: Json } {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Type guard to check if a Json value has demographic data
export function hasAudienceDemographic(data: Json | null | undefined): boolean {
  if (!isJsonObject(data)) return false;
  return isJsonObject(data.demographic);
}

// Type guard to check if a Json value has geographic data
export function hasAudienceGeographic(data: Json | null | undefined): boolean {
  if (!isJsonObject(data)) return false;
  return isJsonObject(data.geographic);
}

export const formatUserCount = (count: string | number | null | undefined): string => {
  if (!count) return "N/A";
  
  const numValue = typeof count === 'string' ? parseInt(count.replace(/,/g, ''), 10) : count;
  if (isNaN(Number(numValue))) return "N/A";
  
  return `${Math.round(Number(numValue) / 1000000)}M`;
};

// Simplified version that doesn't actually do anything with the data
export const fetchPlatformsFromSupabase = async (
  data: CampaignData,
  autoSuggestEnabled: boolean,
  setSelectedPlatforms: (platforms: string[]) => void
) => {
  let query = supabase.from("platforms").select("*");

  // Filter by industry if specified
  if (data.industry) {
    query = query.eq("industry", data.industry);
  }

  const { data: platformsData, error } = await query;

  if (error) {
    throw error;
  }

  if (!platformsData) {
    return [];
  }

  // Transform the raw platforms data using enhancePlatform
  const enhancedPlatforms = platformsData.map(platform => enhancePlatform(platform));
  
  return enhancedPlatforms;
};
