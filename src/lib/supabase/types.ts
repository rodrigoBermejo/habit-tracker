/*
  Tipos de la base de datos (frontera tipada con Supabase, exigida por AGENTS.md).

  Escritos a mano según docs/adr/0001-modelo-de-datos.md. Cuando el MCP de Supabase
  esté autenticado, regenerar con:
    supabase gen types typescript --project-id ncpdpkkbojwhrzprkxgw > src/lib/supabase/types.ts
  manteniendo este mismo shape `Database`.
*/

export type HabitFrequency = "diaria" | "semanal";

export type PlanStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "none";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          timezone: string;
          onboarded_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          timezone?: string;
          onboarded_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          timezone?: string;
          onboarded_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          frequency: HabitFrequency;
          target_per_week: number | null;
          reminder_hour: string | null;
          best_streak: number;
          archived_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          frequency: HabitFrequency;
          target_per_week?: number | null;
          reminder_hour?: string | null;
          best_streak?: number;
          archived_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          frequency?: HabitFrequency;
          target_per_week?: number | null;
          reminder_hour?: string | null;
          best_streak?: number;
          archived_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      checkins: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          date: string;
          done: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          date: string;
          done?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          date?: string;
          done?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          user_id: string;
          status: PlanStatus;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          status?: PlanStatus;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          status?: PlanStatus;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      reminder_log: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          date: string;
          subject: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          date: string;
          subject: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          habit_id?: string;
          user_id?: string;
          date?: string;
          subject?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      habit_frequency: HabitFrequency;
      plan_status: PlanStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

/* Atajos de fila para uso en la app */
export type Habit = Database["public"]["Tables"]["habits"]["Row"];
export type HabitInsert = Database["public"]["Tables"]["habits"]["Insert"];
export type HabitUpdate = Database["public"]["Tables"]["habits"]["Update"];
export type Checkin = Database["public"]["Tables"]["checkins"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Subscription = Database["public"]["Tables"]["subscriptions"]["Row"];
