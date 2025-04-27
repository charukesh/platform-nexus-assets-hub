export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      assets: {
        Row: {
          amount: number | null
          buy_types: string
          category: string
          created_at: string | null
          description: string | null
          embedding: string | null
          estimated_clicks: number
          estimated_impressions: number
          file_size: string | null
          file_url: string | null
          id: string
          name: string
          placement: string | null
          platform_id: string
          tags: string[] | null
          thumbnail_url: string | null
          type: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          amount?: number | null
          buy_types?: string
          category: string
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          estimated_clicks?: number
          estimated_impressions?: number
          file_size?: string | null
          file_url?: string | null
          id?: string
          name: string
          placement?: string | null
          platform_id: string
          tags?: string[] | null
          thumbnail_url?: string | null
          type: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          amount?: number | null
          buy_types?: string
          category?: string
          created_at?: string | null
          description?: string | null
          embedding?: string | null
          estimated_clicks?: number
          estimated_impressions?: number
          file_size?: string | null
          file_url?: string | null
          id?: string
          name?: string
          placement?: string | null
          platform_id?: string
          tags?: string[] | null
          thumbnail_url?: string | null
          type?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      platforms: {
        Row: {
          audience_data: Json | null
          campaign_data: Json | null
          created_at: string | null
          dau: string | null
          device_split: Json | null
          embedding: string | null
          id: string
          industry: string
          logo_url: string | null
          mau: string | null
          name: string
          premium_users: number | null
          restrictions: Json | null
          updated_at: string | null
        }
        Insert: {
          audience_data?: Json | null
          campaign_data?: Json | null
          created_at?: string | null
          dau?: string | null
          device_split?: Json | null
          embedding?: string | null
          id?: string
          industry: string
          logo_url?: string | null
          mau?: string | null
          name: string
          premium_users?: number | null
          restrictions?: Json | null
          updated_at?: string | null
        }
        Update: {
          audience_data?: Json | null
          campaign_data?: Json | null
          created_at?: string | null
          dau?: string | null
          device_split?: Json | null
          embedding?: string | null
          id?: string
          industry?: string
          logo_url?: string | null
          mau?: string | null
          name?: string
          premium_users?: number | null
          restrictions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      immutable_tsvector_concat: {
        Args: {
          name: string
          description: string
          category: string
          tags: string[]
        }
        Returns: unknown
      }
      match_assets_by_embedding_only: {
        Args: {
          query_embedding: string
          query_text: string
          match_threshold: number
          match_count: number
        }
        Returns: {
          id: string
          name: string
          category: string
          description: string
          thumbnail_url: string
          file_url: string
          type: string
          tags: string[]
          buy_types: string
          amount: number
          platform_id: string
          platform_name: string
          platform_industry: string
          platform_audience_data: Json
          platform_campaign_data: Json
          platform_device_split: Json
          platform_mau: string
          platform_dau: string
          platform_premium_users: number
          platform_restrictions: Json
          placement: string
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
