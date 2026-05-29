import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Habit, HabitFrequency } from "@/lib/supabase/types";

/* Errores de negocio tipados para que la UI muestre el mensaje correcto. */
export class DuplicateNameError extends Error {
  constructor() {
    super("Ya tienes un hábito activo con ese nombre");
    this.name = "DuplicateNameError";
  }
}
export class HabitLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "HabitLimitError";
  }
}

type PgError = { code?: string; message?: string };

function mapWriteError(error: PgError): Error {
  if (error.code === "23505") return new DuplicateNameError();
  if (error.code === "23514" && /límite/i.test(error.message ?? "")) {
    return new HabitLimitError(error.message ?? "Alcanzaste el límite de hábitos");
  }
  return new Error(error.message ?? "No se pudo guardar");
}

export type HabitInput = {
  name: string;
  description: string | null;
  frequency: HabitFrequency;
  target_per_week: number | null;
  reminder_hour: string | null;
};

export async function getHabits(userId: string): Promise<Habit[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getArchivedHabits(userId: string): Promise<Habit[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", userId)
    .not("archived_at", "is", null)
    .order("archived_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Un hábito por id. Devuelve null si no existe o no es del usuario (RLS) -> 404. */
export async function getHabit(id: string): Promise<Habit | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createHabit(userId: string, input: HabitInput): Promise<Habit> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("habits")
    .insert({ ...input, user_id: userId })
    .select()
    .single();
  if (error) throw mapWriteError(error);
  return data;
}

export async function updateHabit(id: string, input: HabitInput): Promise<Habit> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("habits")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw mapWriteError(error);
  return data;
}

export async function archiveHabit(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("habits")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function unarchiveHabit(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("habits")
    .update({ archived_at: null })
    .eq("id", id);
  if (error) throw mapWriteError(error);
}
