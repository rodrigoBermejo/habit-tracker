"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./types";

/*
  Cliente Supabase para Client Components (ADR-0003). Singleton para no crear
  múltiples instancias de GoTrue. Usa las claves públicas; la seguridad real
  la da RLS (ADR-0001).
*/
let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Copia .env.example a .env.local y rellena tus claves de Supabase.",
    );
  }

  browserClient = createBrowserClient<Database>(url, anonKey);
  return browserClient;
}
