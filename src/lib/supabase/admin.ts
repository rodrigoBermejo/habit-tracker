import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/*
  Cliente Supabase con service-role (ADR-0003 / ADR-0004). Se salta RLS: úsalo
  SOLO en Route Handlers de servidor (pago simulado, recordatorios). El import
  "server-only" hace fallar el build si este módulo llega a un bundle de cliente.
*/
export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY para el cliente admin.",
    );
  }

  return createClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
