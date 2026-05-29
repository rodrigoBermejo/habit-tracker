import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Checkin } from "@/lib/supabase/types";

export type DoneCheckin = { habit_id: string; date: string };

/** Todas las fechas "hecho" del usuario (para estado de hoy y rachas). */
export async function getDoneCheckins(userId: string): Promise<DoneCheckin[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("checkins")
    .select("habit_id, date")
    .eq("user_id", userId)
    .eq("done", true);
  if (error) throw error;
  return data ?? [];
}

/** Check-ins de un hábito en un rango (franja / estadísticas). */
export async function getHabitCheckins(
  habitId: string,
  from: string,
  to: string,
): Promise<Checkin[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("checkins")
    .select("*")
    .eq("habit_id", habitId)
    .gte("date", from)
    .lte("date", to)
    .order("date", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Fechas "hecho" de un hábito (para racha y franja en el detalle). */
export async function getHabitDoneDates(habitId: string): Promise<string[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("checkins")
    .select("date")
    .eq("habit_id", habitId)
    .eq("done", true);
  if (error) throw error;
  return (data ?? []).map((r) => r.date);
}

/** Toggle hecho/no-hecho del día (UPSERT por (habit_id, date), criterio 18). */
export async function upsertCheckin(
  habitId: string,
  userId: string,
  date: string,
  done: boolean,
): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("checkins")
    .upsert(
      { habit_id: habitId, user_id: userId, date, done },
      { onConflict: "habit_id,date" },
    );
  if (error) throw error;
}

/** Actualiza best_streak de forma monótona (nunca a la baja, ADR-0001). */
export async function bumpBestStreak(habitId: string, streak: number): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("habits")
    .select("best_streak")
    .eq("id", habitId)
    .single();
  if (error) throw error;
  if (streak > (data?.best_streak ?? 0)) {
    const { error: updErr } = await supabase
      .from("habits")
      .update({ best_streak: streak })
      .eq("id", habitId);
    if (updErr) throw updErr;
  }
}
