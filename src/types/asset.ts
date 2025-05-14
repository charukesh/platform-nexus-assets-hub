
export interface Asset {
  id: string;
  name: string;
  description?: string;
  category: "Digital" | "Physical" | "Phygital";
  type: string;
  placement?: string;
  thumbnail_url?: string;
  file_size?: string;
  created_at: string;
  buy_types: string;
  amount?: number;
  tags?: string[];
  ctr?: number;
  vtr?: number;
  platforms?: {
    name: string;
    industry?: string;
    description?: string;
    audience_data?: any;
    campaign_data?: any;
    device_split?: any;
    mau?: string;
    dau?: string;
    premium_users?: number;
    restrictions?: any;
  };
  platform_id?: string;
  similarity?: number;
  ad_format?: string;
  ad_type?: string;
  deliverables?: string;
  cta?: string;
  snapshot_ref?: string;
  minimum_cost?: number;
  moq?: string;
  rate_inr?: number;
  gtm_rate?: number;
}

export const PLACEMENT_OPTIONS = [
  'Homepage Banner',
  'Order Page',
  'In-stream Page',
  'Ride Page',
  'Payment Success Screen'
] as const;

export type Placement = typeof PLACEMENT_OPTIONS[number];

export const BUY_TYPE_OPTIONS = [
  'Cost Per Bag',
  'Cost Per Click',
  'Cost Per Day',
  'Cost Per Engagement', 
  'Cost Per Flyer',
  'Cost Per Jingle',
  'Cost Per Lead',
  'Cost Per Mille',
  'Cost Per Month',
  'Cost Per Order',
  'Cost Per Post',
  'Cost Per Sample',
  'Cost Per Scratch',
  'Cost Per Society',
  'Cost Per Spot',
  'Cost Per Story',
  'Cost Per Trip',
  'Cost Per Unit',
  'Cost Per Unlock',
  'Cost Per t-shirt',
  'Cost Per Activation'
] as const;

export type BuyType = typeof BUY_TYPE_OPTIONS[number];

export const AD_FORMAT_OPTIONS = [
  'Static',
  'GIF',
  'Video',
  'Audio',
  'HTML',
  'Playable'
] as const;

export type AdFormat = typeof AD_FORMAT_OPTIONS[number];

export const AD_TYPE_OPTIONS = [
  'Interstitial',
  'Banner',
  'Native',
  'Video',
  'Carousel',
  'Playable',
  'Rewarded'
] as const;

export type AdType = typeof AD_TYPE_OPTIONS[number];

export const CATEGORY_OPTIONS = [
  'Digital',
  'Physical',
  'Phygital'
] as const;

export const DELIVERABLES_OPTIONS = [
  'Image',
  'Video',
  'Script',
  'Audio',
  'HTML',
  'Documentation'
] as const;

export type Deliverables = typeof DELIVERABLES_OPTIONS[number];

export const CTA_OPTIONS = [
  'Shop Now',
  'Learn More',
  'Sign Up',
  'Download',
  'Contact Us',
  'Book Now',
  'Subscribe',
  'Play Now',
  'None'
] as const;

export type CTA = typeof CTA_OPTIONS[number];
