
// Re-export types from the main types file
import { 
  Asset, 
  CampaignData, 
  PlatformDbRecord, 
  PlatformWithAssets 
} from "@/types/campaign";

export type { 
  Asset, 
  CampaignData, 
  PlatformDbRecord, 
  PlatformWithAssets 
};

// Types specific to quotation generation
export interface QuotationResult {
  platforms: PlatformWithAssets[];
  totalCost: number;
  totalImpressions: number;
  campaignDays: number;
}

export interface AssetWithScoring extends Asset {
  targeting_score: number;
}
