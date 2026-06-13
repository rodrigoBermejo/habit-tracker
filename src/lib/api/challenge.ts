import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type {
  ChallengeTask,
  ChallengeEnrollment,
  ChallengeCompletion,
} from "@/lib/supabase/types";

/* Error de escritura del reto. El servidor rechaza completar fuera del día
   actual o sin reto activo (trigger enforce_challenge_progress, ADR-0006). */
export class ChallengeWriteError extends Error {
  constructor(message = "No se pudo guardar, intenta de nuevo") {
    super(message);
    this.name = "ChallengeWriteError";
  }
}

/** Las 28 tareas del reto, ordenadas por día. Contenido común a todos. */
export async function getChallengeTasks(): Promise<ChallengeTask[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("challenge_tasks")
    .select("*")
    .order("day_number", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Inscripción del usuario, o null si no se ha inscrito. */
export async function getEnrollment(userId: string): Promise<ChallengeEnrollment | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("challenge_enrollments")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function enrollInChallenge(
  userId: string,
  startedOn: string,
): Promise<ChallengeEnrollment> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("challenge_enrollments")
    .insert({ user_id: userId, started_on: startedOn })
    .select()
    .single();
  if (error) throw new ChallengeWriteError();
  return data;
}

export async function getCompletions(userId: string): Promise<ChallengeCompletion[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("challenge_completions")
    .select("*")
    .eq("user_id", userId)
    .order("day_number", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Completa la tarea del día. El servidor valida que sea el día actual. */
export async function completeDay(
  userId: string,
  dayNumber: number,
  completedOn: string,
): Promise<ChallengeCompletion> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("challenge_completions")
    .insert({ user_id: userId, day_number: dayNumber, completed_on: completedOn })
    .select()
    .single();
  if (error) throw new ChallengeWriteError();
  return data;
}
