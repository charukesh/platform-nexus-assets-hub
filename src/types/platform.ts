
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
  gender_targeting_available?: boolean;
  state_level_targeting?: boolean;
  city_level_targeting?: boolean;
  platform_specific_targeting?: string[];
}

export interface DeviceSplit {
  ios: number;
  android: number;
  web?: number;
}

export interface CampaignData {
  funnel_stage?: string;
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
