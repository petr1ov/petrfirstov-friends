export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          telegram_id: number
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          telegram_id: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          telegram_id?: number
        }
        Relationships: []
      }
      bot_users: {
        Row: {
          created_at: string
          first_name: string | null
          goal: string | null
          id: string
          last_active_at: string
          niche: string | null
          services: string | null
          source: string | null
          telegram_id: number
          username: string | null
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          goal?: string | null
          id?: string
          last_active_at?: string
          niche?: string | null
          services?: string | null
          source?: string | null
          telegram_id: number
          username?: string | null
        }
        Update: {
          created_at?: string
          first_name?: string | null
          goal?: string | null
          id?: string
          last_active_at?: string
          niche?: string | null
          services?: string | null
          source?: string | null
          telegram_id?: number
          username?: string | null
        }
        Relationships: []
      }
      clicks: {
        Row: {
          id: string
          ip: string | null
          ref_code: string
          timestamp: string
        }
        Insert: {
          id?: string
          ip?: string | null
          ref_code: string
          timestamp?: string
        }
        Update: {
          id?: string
          ip?: string | null
          ref_code?: string
          timestamp?: string
        }
        Relationships: []
      }
      event_offers: {
        Row: {
          created_at: string
          event_code: string
          id: string
          sold_count: number
          tier1_limit: number
          tier1_price: number
          tier2_limit: number
          tier2_price: number
          tier3_limit: number
          tier3_price: number
        }
        Insert: {
          created_at?: string
          event_code: string
          id?: string
          sold_count?: number
          tier1_limit?: number
          tier1_price?: number
          tier2_limit?: number
          tier2_price?: number
          tier3_limit?: number
          tier3_price?: number
        }
        Update: {
          created_at?: string
          event_code?: string
          id?: string
          sold_count?: number
          tier1_limit?: number
          tier1_price?: number
          tier2_limit?: number
          tier2_price?: number
          tier3_limit?: number
          tier3_price?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          contact: string | null
          created_at: string
          id: string
          name: string | null
          ref_code: string
          status: Database["public"]["Enums"]["lead_status"]
          telegram: string | null
        }
        Insert: {
          contact?: string | null
          created_at?: string
          id?: string
          name?: string | null
          ref_code: string
          status?: Database["public"]["Enums"]["lead_status"]
          telegram?: string | null
        }
        Update: {
          contact?: string | null
          created_at?: string
          id?: string
          name?: string | null
          ref_code?: string
          status?: Database["public"]["Enums"]["lead_status"]
          telegram?: string | null
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string
          id: string
          name: string
          ref_code: string
          telegram_id: number
          traffic_source: string | null
          username: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          ref_code: string
          telegram_id: number
          traffic_source?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          ref_code?: string
          telegram_id?: number
          traffic_source?: string | null
          username?: string | null
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number
          created_at: string
          id: string
          partner_id: string
          status: Database["public"]["Enums"]["payout_status"]
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          partner_id: string
          status?: Database["public"]["Enums"]["payout_status"]
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          partner_id?: string
          status?: Database["public"]["Enums"]["payout_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payouts_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "partners"
            referencedColumns: ["id"]
          },
        ]
      }
      user_actions: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          telegram_id: number
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          telegram_id: number
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          telegram_id?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      lead_status: "new" | "in_progress" | "client" | "rejected"
      payout_status: "pending" | "paid" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      lead_status: ["new", "in_progress", "client", "rejected"],
      payout_status: ["pending", "paid", "cancelled"],
    },
  },
} as const
