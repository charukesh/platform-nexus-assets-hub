
export interface PlatformFormData {
  name: string;
  industry: string;
  description?: string;  // Added description field
  mau: string;
  dau: string;
  premium_users: number | null;
  audience_data: AudienceData;
  device_split: DeviceSplit;
  campaign_data: CampaignData;
  restrictions: Restrictions;
  logo_url?: string | null;
}

export const INDUSTRY_OPTIONS = [
  'QSR',
  'Ride Hailing',
  'Finance & Payments',
  'Travel & Bookings',
  'Music',
  'News & Info',
  'Calling Assistant'
] as const;

export type Industry = typeof INDUSTRY_OPTIONS[number];

export interface AudienceData {
  age_groups?: {
    '13-17'?: number;
    '18-24'?: number;
    '25-34'?: number;
    '35-44'?: number;
    '45-54'?: number;
    '55+'?: number;
  };
  gender?: {
    male?: number;
    female?: number;
    other?: number;
  };
  interests?: string[];
  age_targeting_available?: boolean;
  age_targeting_values?: string[] | string;
  gender_targeting_available?: boolean;
  gender_targeting_values?: string[] | string;
  state_level_targeting?: boolean;
  state_targeting_values?: string[] | string;
  city_level_targeting?: boolean;
  city_targeting_values?: string[] | string;
  pincode_level_targeting?: boolean;
  pincode_targeting_values?: string[] | string;
  platform_specific_targeting?: string[];
  demographic?: {
    ageGroups?: DemographicData[];
    gender?: DemographicData[];
    interests?: DemographicData[];
  };
  geographic?: {
    cities?: DemographicData[];
    states?: DemographicData[];
    regions?: DemographicData[];
  };
}

export interface DeviceSplit {
  ios: number;
  android: number;
  web?: number;
}

export interface CampaignData {
  funnel_stage?: string | string[];
  buying_model?: string;
  ad_formats?: string[];
  special_innovations?: string[];
  cta_support?: boolean;
  minimum_spend?: number;
  geography_presence?: string | string[];
}

export interface Restrictions {
  restricted_categories?: string[];
}

// This is for Supabase JSON compatibility
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export const PLACEMENT_OPTIONS = [
  'Homepage Banner',
  'Order Page',
  'In-stream Page',
  'Ride Page',
  'Payment Success Screen'
] as const;

export type Placement = typeof PLACEMENT_OPTIONS[number];

// Interface for demographic data used in PlatformDetail.tsx
export interface DemographicData {
  name: string;
  percentage: number;
}
