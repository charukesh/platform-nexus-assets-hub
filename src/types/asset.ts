
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
  estimated_impressions: number;
  estimated_clicks: number;
  tags?: string[];
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

// Add placement options constant
export const PLACEMENT_OPTIONS = [
  'Homepage Banner',
  'Order Page',
  'In-stream Page',
  'Ride Page',
  'Payment Success Screen'
] as const;

export type Placement = typeof PLACEMENT_OPTIONS[number];
