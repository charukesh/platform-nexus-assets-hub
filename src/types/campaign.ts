
import { Json } from "@/integrations/supabase/types";

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
  dau?: string | null;
  premium_users?: number | null;
  device_split?: any;
  campaign_data?: any;
  logo_url?: string; // Add logo_url property
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

export interface CampaignData {
  industry: string;
  demographics: {
    ageGroups: string[];
    gender: string[];
    interests: string[];
  };
  geographics: {
    cities: string[];
    states: string[];
    tierLevels: string[];
  };
  objectives: string[];
  duration: {
    startDate: Date | undefined;
    endDate: Date | undefined;
  };
  budget: number;
  assetCategories: string[];
  platformPreferences: string[];
  // Additional targeting options can be added here
  premiumOnly?: boolean;
  platformTypes?: string[]; // Mobile, CTV, Web
}

export interface FormDataType {
  name: string;
  industry: string;
  mau: string;
  dau: string;
  premium_users: number;
  premium_users_display_as_percentage: boolean;
  device_split: {
    android: number;
    ios: number;
    web?: number;
    other?: number;
  };
  audience_data: {
    demographic: {
      ageGroups: string[];
      gender: string[];
      interests: string[];
    };
    geographic: {
      cities: string[];
      states: string[];
      regions: string[];
      pincodes: string[];
      tierLevels: string[]; // Add tierLevels property
    };
    supports: {
      targeting: boolean;
      customSegments: boolean;
      lookalikes: boolean;
    };
  };
  campaign_data: {
    formats: string[];
    adUnits: string[];
    tracking: string[];
  };
  restrictions: {
    categories: string[];
    placements: string[];
    content: string[];
  };
}
