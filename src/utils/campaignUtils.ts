
import { Json } from "@/integrations/supabase/types";
import { 
  Asset, 
  AudienceData, 
  Platform, 
  PlatformDbRecord 
} from "@/types/campaign";

export function isAudienceData(value: unknown): value is AudienceData {
  return value !== null && typeof value === 'object';
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
export const enhanceAsset = (asset: any): Asset => {
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
export const enhancePlatform = (platform: PlatformDbRecord): Platform => {
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
