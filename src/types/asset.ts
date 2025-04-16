
export interface Asset {
  id: string;
  name: string;
  description?: string;
  category: "Digital" | "Physical" | "Phygital";
  type: string;
  thumbnail_url?: string;
  file_size?: string;
  created_at: string;
  buy_types: string; // Changed from string[] to string
  amount?: number; // New field
  estimated_impressions: number;
  estimated_clicks: number;
  tags?: string[];
  platforms?: {
    name: string;
  };
  platform_id?: string;
}
