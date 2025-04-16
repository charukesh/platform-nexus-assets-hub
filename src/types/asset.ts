
export interface Asset {
  id: string;
  name: string;
  description?: string;
  category: "Digital" | "Physical" | "Phygital";
  type: string;
  thumbnail_url?: string;
  file_size?: string;
  created_at: string;
  buy_types: string[];
  estimated_impressions: number;
  estimated_clicks: number;
  tags?: string[];
  platforms?: {
    name: string;
  };
  platform_id?: string;
}
