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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          description: string
          icon: string
          id: string
          name: string
          slug: string
          tone: string
        }
        Insert: {
          description: string
          icon: string
          id?: string
          name: string
          slug: string
          tone?: string
        }
        Update: {
          description?: string
          icon?: string
          id?: string
          name?: string
          slug?: string
          tone?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_seconds_target: number
          frequency: Database["public"]["Enums"]["goal_frequency"]
          id: string
          language: string | null
          period_start: string
          progress_seconds: number
          status: Database["public"]["Enums"]["goal_status"]
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_seconds_target: number
          frequency?: Database["public"]["Enums"]["goal_frequency"]
          id?: string
          language?: string | null
          period_start?: string
          progress_seconds?: number
          status?: Database["public"]["Enums"]["goal_status"]
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_seconds_target?: number
          frequency?: Database["public"]["Enums"]["goal_frequency"]
          id?: string
          language?: string | null
          period_start?: string
          progress_seconds?: number
          status?: Database["public"]["Enums"]["goal_status"]
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          admin_id: string
          created_at: string
          discord_webhook_url: string | null
          id: string
          is_arena_public: boolean
          join_code: string
          name: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          discord_webhook_url?: string | null
          id?: string
          is_arena_public?: boolean
          join_code: string
          name: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          discord_webhook_url?: string | null
          id?: string
          is_arena_public?: boolean
          join_code?: string
          name?: string
        }
        Relationships: []
      }
      interactions: {
        Row: {
          created_at: string
          group_id: string | null
          id: string
          message: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
          type: Database["public"]["Enums"]["interaction_type"]
        }
        Insert: {
          created_at?: string
          group_id?: string | null
          id?: string
          message?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
          type: Database["public"]["Enums"]["interaction_type"]
        }
        Update: {
          created_at?: string
          group_id?: string | null
          id?: string
          message?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
          type?: Database["public"]["Enums"]["interaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "interactions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_streak: number
          display_name: string
          email: string | null
          group_id: string | null
          id: string
          last_active_date: string | null
          longest_streak: number
          onboarded: boolean
          reminders_enabled: boolean
          show_languages: boolean
          show_projects: boolean
          show_total: boolean
          theme: string
          timezone: string
          updated_at: string
          wakatime_connected: boolean
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_streak?: number
          display_name?: string
          email?: string | null
          group_id?: string | null
          id: string
          last_active_date?: string | null
          longest_streak?: number
          onboarded?: boolean
          reminders_enabled?: boolean
          show_languages?: boolean
          show_projects?: boolean
          show_total?: boolean
          theme?: string
          timezone?: string
          updated_at?: string
          wakatime_connected?: boolean
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_streak?: number
          display_name?: string
          email?: string | null
          group_id?: string | null
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          onboarded?: boolean
          reminders_enabled?: boolean
          show_languages?: boolean
          show_projects?: boolean
          show_total?: boolean
          theme?: string
          timezone?: string
          updated_at?: string
          wakatime_connected?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "profiles_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      reminders_sent: {
        Row: {
          created_at: string
          goal_id: string
          id: string
          sent_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal_id: string
          id?: string
          sent_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal_id?: string
          id?: string
          sent_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminders_sent_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      wakatime_credentials: {
        Row: {
          connected_at: string
          encrypted_key: string
          key_preview: string | null
          user_id: string
        }
        Insert: {
          connected_at?: string
          encrypted_key: string
          key_preview?: string | null
          user_id: string
        }
        Update: {
          connected_at?: string
          encrypted_key?: string
          key_preview?: string | null
          user_id?: string
        }
        Relationships: []
      }
      wakatime_logs: {
        Row: {
          created_at: string
          hourly: Json
          id: string
          languages: Json
          log_date: string
          projects: Json
          synced_at: string
          top_language: string | null
          top_project: string | null
          total_seconds: number
          user_id: string
        }
        Insert: {
          created_at?: string
          hourly?: Json
          id?: string
          languages?: Json
          log_date: string
          projects?: Json
          synced_at?: string
          top_language?: string | null
          top_project?: string | null
          total_seconds?: number
          user_id: string
        }
        Update: {
          created_at?: string
          hourly?: Json
          id?: string
          languages?: Json
          log_date?: string
          projects?: Json
          synced_at?: string
          top_language?: string | null
          top_project?: string | null
          total_seconds?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _range_start: { Args: { p_range: string }; Returns: string }
      auth_group_id: { Args: Record<PropertyKey, never>; Returns: string }
      create_group: {
        Args: { group_name: string }
        Returns: {
          admin_id: string
          created_at: string
          discord_webhook_url: string | null
          id: string
          is_arena_public: boolean
          join_code: string
          name: string
        }
      }
      generate_join_code: { Args: Record<PropertyKey, never>; Returns: string }
      get_arena_leaderboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          group_id: string
          group_name: string
          is_my_group: boolean
          member_count: number
          total_seconds: number
        }[]
      }
      get_group_leaderboard: {
        Args: { p_range?: string }
        Returns: {
          avatar_url: string
          current_streak: number
          display_name: string
          is_me: boolean
          top_language: string
          top_project: string
          total_seconds: number
          user_id: string
        }[]
      }
      get_my_goals: {
        Args: Record<PropertyKey, never>
        Returns: {
          computed_seconds: number
          created_at: string
          duration_seconds_target: number
          frequency: Database["public"]["Enums"]["goal_frequency"]
          id: string
          language: string
          period_start: string
          status: Database["public"]["Enums"]["goal_status"]
          title: string
        }[]
      }
      goal_period_seconds: {
        Args: {
          p_freq: Database["public"]["Enums"]["goal_frequency"]
          p_language: string
          p_user: string
        }
        Returns: number
      }
      is_group_admin: { Args: { target_group: string }; Returns: boolean }
      join_group: {
        Args: { code: string }
        Returns: {
          admin_id: string
          created_at: string
          discord_webhook_url: string | null
          id: string
          is_arena_public: boolean
          join_code: string
          name: string
        }
      }
      leave_group: { Args: Record<PropertyKey, never>; Returns: undefined }
      recompute_streak: { Args: { target: string }; Returns: undefined }
      remove_member: { Args: { member: string }; Returns: undefined }
    }
    Enums: {
      goal_frequency: "daily" | "weekly"
      goal_status: "active" | "completed" | "failed" | "archived"
      interaction_type: "nudge" | "kudo"
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
