export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      loading_charge: {
        Row: {
          created_at: string
          custom_transaction_id: number | null
          distance_travelled: number | null
          driver_name: string
          loading_chainage: string
          location: Json
          material: string | null
          net_mass: string
          offloading_location: Json | null
          offloading_photo: string | null
          status: string
          offloading_destination: Json | null
          time_taken: number | null
          transaction_id: number
          transaction_uuid: string
          updated_at: string
          user_id: string
          vehicle_number: string
          vehicle_photo: string | null
        }
        Insert: {
          created_at?: string
          custom_transaction_id?: number | null
          distance_travelled?: number | null
          driver_name: string
          loading_chainage: string
          location: Json
          material?: string | null
          net_mass: string
          offloading_location?: Json | null
          offloading_photo?: string | null
          status?: string
          offloading_destination?: Json | null 
          time_taken?: number | null
          transaction_id?: number
          transaction_uuid: string
          updated_at?: string
          user_id: string
          vehicle_number: string
          vehicle_photo?: string | null
        }
        Update: {
          created_at?: string
          custom_transaction_id?: number | null
          distance_travelled?: number | null
          driver_name?: string
          loading_chainage?: string
          location?: Json
          material?: string | null
          net_mass?: string
          offloading_location?: Json | null
          offloading_photo?: string | null
          status?: string
          offloading_destination?: Json | null 
          time_taken?: number | null
          transaction_id?: number
          transaction_uuid?: string
          updated_at?: string
          user_id?: string
          vehicle_number?: string
          vehicle_photo?: string | null
        }
        Relationships: []
      }
      topics: {
        Row: {
          created_at: string
          id: number
          lang: string
          page_uuid: string
          progress: string
          reading_level: string
          sections: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          lang: string
          page_uuid: string
          progress?: string
          reading_level: string
          sections: Json
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: number
          lang?: string
          page_uuid?: string
          progress?: string
          reading_level?: string
          sections?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      truck_drivers: {
        Row: {
          contact: string | null
          created_at: string
          cubic_meters: number
          driver_name: string
          id: string
          license_photo_url: string | null
          number_plate: string
          updated_at: string
        }
        Insert: {
          contact?: string | null
          created_at?: string
          cubic_meters: number
          driver_name: string
          id?: string
          license_photo_url?: string | null
          number_plate: string
          updated_at?: string
        }
        Update: {
          contact?: string | null
          created_at?: string
          cubic_meters?: number
          driver_name?: string
          id?: string
          license_photo_url?: string | null
          number_plate?: string
          updated_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          firstname: string | null
          imageurl: string | null
          is_blocked: boolean | null
          lastname: string | null
          phonenumbers: Json | null
          updated_at: string | null
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string | null
          firstname?: string | null
          imageurl?: string | null
          is_blocked?: boolean | null
          lastname?: string | null
          phonenumbers?: Json | null
          updated_at?: string | null
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string | null
          firstname?: string | null
          imageurl?: string | null
          is_blocked?: boolean | null
          lastname?: string | null
          phonenumbers?: Json | null
          updated_at?: string | null
          user_id?: string
          username?: string | null
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
      [_ in never]: never
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
    Enums: {},
  },
} as const



