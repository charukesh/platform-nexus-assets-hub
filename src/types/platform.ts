
export interface PlatformFormData {
  name: string;
  industry: string;
  mau: string;
  dau: string;
  premium_users: number | null;
  audience_data: AudienceData;
  device_split: DeviceSplit;
  campaign_data: CampaignData;
  restrictions: Restrictions;
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
  age_targeting_values?: string;
  gender_targeting_available?: boolean;
  gender_targeting_values?: string;
  state_level_targeting?: boolean;
  state_targeting_values?: string;
  city_level_targeting?: boolean;
  city_targeting_values?: string;
  pincode_level_targeting?: boolean;
  pincode_targeting_values?: string;
  platform_specific_targeting?: string[];
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
  geography_presence?: string;
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
