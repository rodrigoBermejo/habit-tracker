import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Subscription } from "@/lib/supabase/types";

export async function getSubscription(userId: string): Promise<Subscription | null> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/* Premium = activa/trial y no vencida (ADR-0001/0004). */
export function isPremiumFrom(sub: Subscription | null): boolean {
  if (!sub) return false;
  const activeStatus = sub.status === "active" || sub.status === "trialing";
  if (!activeStatus) return false;
  if (!sub.current_period_end) return true;
  return new Date(sub.current_period_end).getTime() > Date.now();
}

export const FREE_LIMIT = 3;
export const PREMIUM_LIMIT = 30;
