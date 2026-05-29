import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/supabase/types";

/* Lee el profile del usuario (incluye onboarded_at y timezone). */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/* Marca el onboarding como completado (criterios 7, 8). */
export async function completeOnboarding(userId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("profiles")
    .update({ onboarded_at: new Date().toISOString() })
    .eq("id", userId);
  if (error) throw error;
}

/* Guarda la zona horaria del navegador si el profile aún no la tiene fijada
   (necesaria para los recordatorios, ADR-0001). */
export async function ensureTimezone(userId: string, timezone: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { error } = await supabase
    .from("profiles")
    .update({ timezone })
    .eq("id", userId);
  if (error) throw error;
}
