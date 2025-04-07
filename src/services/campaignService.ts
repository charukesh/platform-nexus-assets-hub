
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { differenceInDays } from "date-fns";
import { CampaignData } from "@/pages/CampaignQuotation";

export interface Asset {
  id: string;
  name: string;
  type: string;
  platform_id: string;
  status: string;
  description: string | null;
  category: string;
  cost_per_day: number;
  targeting_score: number;
  allocated_budget: number;
  estimated_impressions: number;
  created_at: string | null;
  updated_at: string | null;
  platform_name?: string;
  uploaded_by: string | null;
  restrictions: string | null;
  dimensions: string | null;
  file_url: string | null;
  file_size?: string | null;
  thumbnail_url?: string | null;
  tags?: string[] | null;
}

// This interface matches what comes from the database
export interface PlatformDbRecord {
  id: string;
  name: string;
  industry: string;
  audience_data: Json;
  campaign_data: Json | null;
  created_at: string | null;
  updated_at: string | null;
  dau: string | null;
  mau: string | null;
  premium_users: number | null;
  device_split: Json | null;
  restrictions: Json | null;
  description?: string | null;
}

export interface Platform {
  id: string;
  name: string;
  industry: string;
  description?: string | null;
  type?: string;
  status?: string;
  average_cpm?: number;
  base_cost?: number;
  min_budget?: number;
  audience_reach?: number;
  audience_data: AudienceData;
  capabilities?: string[];
  requirements?: string[];
  restrictions?: string[];
  created_at: string | null;
  updated_at: string | null;
  mau?: string | number;
  dau?: string | number;
  premium_users?: number;
  device_split?: any;
  campaign_data?: any;
}

export interface AudienceData {
  demographic?: {
    ageGroups?: string[];
    gender?: string[];
    interests?: string[];
  };
  geographic?: {
    cities?: string[];
    states?: string[];
    tierLevels?: string[];
  };
}

export interface PlatformWithAssets extends Platform {
  assets: Asset[];
  totalCost?: number;
  totalImpressions?: number;
}

export function isAudienceData(value: unknown): value is AudienceData {
  return value !== null && typeof value === 'object';
}

export interface PlatformAllocation {
  platform: Platform;
  platformAssets: Asset[];
  totalBudget: number;
  days: number;
  estimatedImpressions: number;
}

export interface QuotationSummary {
  totalBudget: number;
  totalPlatforms: number;
  totalAssets: number;
  estimatedImpressions: number;
  campaignDuration: number;
}

export interface Quotation {
  id: string;
  name: string;
  description: string;
  campaignObjective: string;
  targetAudience: string;
  budget: number;
  startDate: Date;
  endDate: Date;
  platformAllocations: PlatformAllocation[];
  createdAt: Date;
  updatedAt: Date;
  summary: QuotationSummary;
}

export const parseAudienceData = (rawData: Json): AudienceData => {
  if (typeof rawData === 'object' && rawData !== null) {
    return rawData as unknown as AudienceData;
  }
  
  return {
    demographic: { ageGroups: [], gender: [], interests: [] },
    geographic: { cities: [], states: [], tierLevels: [] }
  };
};

// Enhance the database asset type to match our Asset interface
const enhanceAsset = (asset: any): Asset => {
  return {
    id: asset.id,
    name: asset.name,
    type: asset.type,
    platform_id: asset.platform_id || "",
    status: asset.status || "active",
    description: asset.description,
    category: asset.category,
    cost_per_day: asset.cost_per_day || 0,
    targeting_score: asset.targeting_score || 0,
    allocated_budget: asset.allocated_budget || 0,
    estimated_impressions: asset.estimated_impressions || 0,
    created_at: asset.created_at,
    updated_at: asset.updated_at,
    uploaded_by: asset.uploaded_by,
    restrictions: asset.restrictions || null,
    dimensions: asset.dimensions || null,
    file_url: asset.file_url,
    file_size: asset.file_size,
    thumbnail_url: asset.thumbnail_url,
    tags: asset.tags
  };
};

// Convert database platform to our Platform interface
const enhancePlatform = (platform: PlatformDbRecord): Platform => {
  const audienceData = parseAudienceData(platform.audience_data);
  
  return {
    id: platform.id,
    name: platform.name,
    industry: platform.industry,
    description: platform.description || null,
    type: "platform", // Default values for fields not in DB
    status: "active",
    average_cpm: 0,
    base_cost: 0,
    min_budget: 0,
    audience_reach: 0,
    audience_data: audienceData,
    capabilities: [],
    requirements: [],
    restrictions: platform.restrictions ? 
      (typeof platform.restrictions === 'string' ? 
        platform.restrictions.split(',') : 
        JSON.stringify(platform.restrictions).split(',')) : 
      [],
    created_at: platform.created_at,
    updated_at: platform.updated_at,
    mau: platform.mau,
    dau: platform.dau,
    premium_users: platform.premium_users,
    device_split: platform.device_split,
    campaign_data: platform.campaign_data
  };
};

export const getPlatformWithAssets = async (id: string): Promise<PlatformWithAssets | null> => {
  try {
    const { data: platform, error: platformError } = await supabase
      .from('platforms')
      .select('*')
      .eq('id', id)
      .single();

    if (platformError) {
      throw platformError;
    }

    if (!platform) {
      return null;
    }

    const { data: assetsData, error: assetsError } = await supabase
      .from('assets')
      .select('*')
      .eq('platform_id', id);

    if (assetsError) {
      throw assetsError;
    }

    // Create assets with required fields
    const assets: Asset[] = (assetsData || []).map(enhanceAsset);

    // Calculate costs and impressions
    const totalCost = assets.reduce((sum, asset) => sum + asset.cost_per_day, 0);
    const totalImpressions = assets.reduce((sum, asset) => sum + asset.estimated_impressions, 0);

    // Create platform with all required fields
    const enhancedPlatform = enhancePlatform(platform as PlatformDbRecord);
    
    return {
      ...enhancedPlatform,
      assets,
      totalCost,
      totalImpressions
    };
  } catch (error) {
    console.error('Error fetching platform with assets:', error);
    throw error;
  }
};

export const generateCampaignQuotation = async (
  data: CampaignData
): Promise<{ 
  platforms: PlatformWithAssets[]; 
  totalCost: number; 
  totalImpressions: number;
  campaignDays: number;
}> => {
  // Determine campaign duration in days
  let campaignDays = 1;
  if (data.duration.startDate && data.duration.endDate) {
    const days = differenceInDays(data.duration.endDate, data.duration.startDate) + 1;
    campaignDays = days > 0 ? days : 1;
  }

  // Ensure there are selected platforms
  if (!data.platformPreferences.length) {
    return { 
      platforms: [], 
      totalCost: 0, 
      totalImpressions: 0,
      campaignDays 
    };
  }

  // Step 1: Primary Filtering - Fetch platforms and assets
  const { data: platformsData, error: platformsError } = await supabase
    .from("platforms")
    .select("*")
    .in("id", data.platformPreferences);

  if (platformsError) throw platformsError;

  const { data: assetsData, error: assetsError } = await supabase
    .from("assets")
    .select("*")
    .in("platform_id", data.platformPreferences)
    .in("category", data.assetCategories);

  if (assetsError) throw assetsError;

  // Step 2: Objective-Based Filtering
  // For now, we assume all assets have the necessary metrics
  // In a real implementation, we would check for relevant metrics based on objectives
  
  // Apply cost and impressions to assets (simulated for now)
  const processedAssets = assetsData.map(asset => enhanceAsset({
    ...asset,
    cost_per_day: Math.floor(Math.random() * 15000) + 5000,
    estimated_impressions: Math.floor(Math.random() * 90000) + 10000,
    targeting_score: 1.0,
  }));

  // Step 3: Targeting-Based Scoring
  // Calculate a matching score for each asset based on demographics, geographics, etc.
  const scoredAssets = processedAssets.map(asset => {
    // Start with a base score
    let score = 1.0;

    // Get the associated platform for the asset
    const platform = platformsData.find(p => p.id === asset.platform_id);
    
    // If we have audience data for the platform, use it for scoring
    if (platform?.audience_data) {
      // Process audience data to ensure correct type
      const audienceData = parseAudienceData(platform.audience_data);
      
      if (audienceData) {
        // Check demographic matches (age groups)
        if (audienceData.demographic?.ageGroups && 
            data.demographics.ageGroups.length > 0) {
          const ageGroupMatch = data.demographics.ageGroups.some(
            age => audienceData.demographic?.ageGroups?.includes(age)
          );
          if (ageGroupMatch) score += 0.2;
        }
        
        // Check gender matches
        if (audienceData.demographic?.gender && 
            data.demographics.gender.length > 0) {
          const genderMatch = data.demographics.gender.some(
            gender => audienceData.demographic?.gender?.includes(gender)
          );
          if (genderMatch) score += 0.2;
        }
        
        // Check interest matches
        if (audienceData.demographic?.interests && 
            data.demographics.interests.length > 0) {
          const interestMatch = data.demographics.interests.some(
            interest => audienceData.demographic?.interests?.includes(interest)
          );
          if (interestMatch) score += 0.2;
        }
        
        // Check geographic matches (cities)
        if (audienceData.geographic?.cities && 
            data.geographics.cities.length > 0) {
          const cityMatch = data.geographics.cities.some(
            city => audienceData.geographic?.cities?.includes(city)
          );
          if (cityMatch) score += 0.2;
        }
        
        // Check geographic matches (states)
        if (audienceData.geographic?.states && 
            data.geographics.states.length > 0) {
          const stateMatch = data.geographics.states.some(
            state => audienceData.geographic?.states?.includes(state)
          );
          if (stateMatch) score += 0.2;
        }
      }
    }
    
    // Additional factors could include:
    // - Tags matching campaign objectives
    // - Asset performance history
    // - Seasonal relevance
    
    return {
      ...asset,
      targeting_score: score
    };
  });

  // Sort assets by targeting score (descending)
  scoredAssets.sort((a, b) => 
    (b.targeting_score || 0) - (a.targeting_score || 0)
  );

  // Step 4: Budget Allocation
  const totalTargetingScore = scoredAssets.reduce(
    (sum, asset) => sum + (asset.targeting_score || 1), 
    0
  );
  
  // Allocate budget proportionally based on targeting score
  const assetsWithBudget = scoredAssets.map(asset => {
    const proportion = (asset.targeting_score || 1) / totalTargetingScore;
    const allocatedBudget = Math.min(
      data.budget * proportion,
      asset.cost_per_day * campaignDays
    );
    
    return {
      ...asset,
      allocated_budget: allocatedBudget
    };
  });

  // Step 5: Final Asset Selection
  // Group assets by platform
  const processedPlatforms: PlatformWithAssets[] = [];
  let calculatedTotalCost = 0;
  let calculatedTotalImpressions = 0;

  platformsData.forEach(platform => {
    const platformAssets = assetsWithBudget.filter(
      asset => asset.platform_id === platform.id
    );
    
    const platformTotalCost = platformAssets.reduce((sum, asset) => {
      // Use the asset's calculated cost based on campaign days
      return sum + asset.cost_per_day * campaignDays;
    }, 0);

    const platformTotalImpressions = platformAssets.reduce((sum, asset) => {
      return sum + asset.estimated_impressions * campaignDays;
    }, 0);

    calculatedTotalCost += platformTotalCost;
    calculatedTotalImpressions += platformTotalImpressions;

    if (platformAssets.length > 0) {
      // Convert the database platform to our Platform interface
      const enhancedPlatform = enhancePlatform(platform as PlatformDbRecord);
      
      processedPlatforms.push({
        ...enhancedPlatform,
        assets: platformAssets,
        totalCost: platformTotalCost,
        totalImpressions: platformTotalImpressions
      });
    }
  });

  return {
    platforms: processedPlatforms,
    totalCost: calculatedTotalCost,
    totalImpressions: calculatedTotalImpressions,
    campaignDays
  };
};
