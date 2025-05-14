export interface PlatformFormData {
  name: string;
  industry: string;
  description?: string;
  mau: string;
  dau: string;
  premium_users: number | null;
  audience_data: AudienceData;
  device_split: DeviceSplit;
  campaign_data: CampaignData;
  restrictions: Restrictions;
  logo_url?: string | null;
  est_reach?: number | null;
  impressions?: number | null;
  comments?: string;
}

export const INDUSTRY_OPTIONS = [
  'QSR',
  'Ride Hailing',
  'Finance & Payments',
  'Travel & Bookings',
  'Music',
  'News & Info',
  'Calling Assistant',
  'E-commerce',
  'Entertainment',
  'Education',
  'Health & Fitness'
] as const;

export type Industry = typeof INDUSTRY_OPTIONS[number];

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
] as const;

export type IndianState = typeof INDIAN_STATES[number];

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
  age_targeting_values?: {
    min: number;
    max: number;
  } | string | string[];
  gender_targeting_available?: boolean;
  gender_targeting_values?: string[] | string;
  geography_presence?: string[];
  states?: string[];
  cities?: string[];
  pincodes?: string[];
  cohorts?: string[];
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
  available_placements?: string[];
  special_innovations?: string | string[];
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
  'Payment Success Screen',
  'Search Results',
  'Product Detail Page',
  'Checkout Page',
  'App Open',
  'In-Feed',
  'Notification'
] as const;

export type Placement = typeof PLACEMENT_OPTIONS[number];

export const AD_FORMAT_OPTIONS = [
  'Banner',
  'Interstitial',
  'Native',
  'Video',
  'Carousel',
  'Rewarded',
  'App Open',
  'Rich Media',
  'Playable',
  'Interactive'
] as const;

export type AdFormat = typeof AD_FORMAT_OPTIONS[number];

export const FUNNEL_STAGE_OPTIONS = [
  'Awareness',
  'Consideration',
  'Conversion',
  'Retention',
  'Advocacy'
] as const;

export type FunnelStage = typeof FUNNEL_STAGE_OPTIONS[number];

export const GENDER_OPTIONS = [
  'Male',
  'Female',
  'Other',
  'Prefer not to say'
] as const;

export type Gender = typeof GENDER_OPTIONS[number];

export const GEOGRAPHY_OPTIONS = [
  'National',
  'Regional',
  'Metro',
  'Non-Metro',
  'Tier 1',
  'Tier 2',
  'Tier 3',
  'Rural'
] as const;

export type Geography = typeof GEOGRAPHY_OPTIONS[number];

export const COHORT_OPTIONS = [
  'High Income Urban',
  'Young Professionals',
  'College Students',
  'Families',
  'Senior Citizens',
  'Rural Audiences'
] as const;

export type Cohort = typeof COHORT_OPTIONS[number];

// Interface for demographic data used in PlatformDetail.tsx
export interface DemographicData {
  name: string;
  percentage: number;
}
