import { Json } from "@/integrations/supabase/types";
import { CampaignData, Platform } from "@/types/campaign";
import { supabase } from "@/integrations/supabase/client";

export { Platform };

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

  // Filter platforms based on demographic and geographic match
  let filteredPlatforms = platformsData;
  
  if (data.demographics.ageGroups.length > 0 || 
      data.demographics.gender.length > 0 || 
      data.demographics.interests.length > 0 || 
      data.geographics.cities.length > 0 || 
      data.geographics.states.length > 0) {
    
    filteredPlatforms = platformsData.filter(platform => {
      // Skip filtering if platform has no audience data
      if (!platform.audience_data) return true;
      
      // Check for demographic matches
      let demographicsMatch = true;
      if (data.demographics.ageGroups.length > 0) {
        // Check if any age group matches - use type guards
        if (hasAudienceDemographic(platform.audience_data)) {
          const audienceData = platform.audience_data as { demographic: { ageGroups?: string[] } };
          if (audienceData.demographic.ageGroups) {
            demographicsMatch = data.demographics.ageGroups.some(
              age => audienceData.demographic.ageGroups?.includes(age)
            );
            if (!demographicsMatch) return false;
          }
        }
      }
      
      if (data.demographics.gender.length > 0) {
        // Check if any gender matches - use type guards
        if (hasAudienceDemographic(platform.audience_data)) {
          const audienceData = platform.audience_data as { demographic: { gender?: string[] } };
          if (audienceData.demographic.gender) {
            demographicsMatch = data.demographics.gender.some(
              gender => audienceData.demographic.gender?.includes(gender)
            );
            if (!demographicsMatch) return false;
          }
        }
      }
      
      if (data.demographics.interests.length > 0) {
        // Check if any interest matches - use type guards
        if (hasAudienceDemographic(platform.audience_data)) {
          const audienceData = platform.audience_data as { demographic: { interests?: string[] } };
          if (audienceData.demographic.interests) {
            demographicsMatch = data.demographics.interests.some(
              interest => audienceData.demographic.interests?.includes(interest)
            );
            if (!demographicsMatch) return false;
          }
        }
      }
      
      // Check for geographic matches
      let geographicsMatch = true;
      if (data.geographics.cities.length > 0) {
        // Check if any city matches - use type guards
        if (hasAudienceGeographic(platform.audience_data)) {
          const audienceData = platform.audience_data as { geographic: { cities?: string[] } };
          if (audienceData.geographic.cities) {
            geographicsMatch = data.geographics.cities.some(
              city => audienceData.geographic.cities?.includes(city)
            );
            if (!geographicsMatch) return false;
          }
        }
      }
      
      if (data.geographics.states.length > 0) {
        // Check if any state matches - use type guards
        if (hasAudienceGeographic(platform.audience_data)) {
          const audienceData = platform.audience_data as { geographic: { states?: string[] } };
          if (audienceData.geographic.states) {
            geographicsMatch = data.geographics.states.some(
              state => audienceData.geographic.states?.includes(state)
            );
            if (!geographicsMatch) return false;
          }
        }
      }
      
      return true;
    });
  }
  
  // Auto-suggest platforms if no manual selection and we have filtered platforms
  if (autoSuggestEnabled && data.platformPreferences.length === 0) {
    // Prioritize platforms that have better audience matches
    let suggestedPlatforms = filteredPlatforms
      .slice(0, Math.min(3, filteredPlatforms.length))
      .map(platform => platform.id);
    
    setSelectedPlatforms(suggestedPlatforms);
  }

  return filteredPlatforms;
};
