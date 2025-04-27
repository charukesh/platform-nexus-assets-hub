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
  platforms?: {
    name: string;
    industry?: string;
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
  'Cost per Activation'
] as const;

export type BuyType = typeof BUY_TYPE_OPTIONS[number];
