import type { PostgrestError } from "@supabase/supabase-js";

/*
  Detección de errores de sesión expirada (criterio 6). Los errores de auth de
  Supabase llegan como PGRST301 / 401 / mensajes de JWT. El AuthProvider escucha
  esto para redirigir a /login con toast.
*/
export function isAuthError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as Partial<PostgrestError> & { status?: number };
  if (e.code === "PGRST301") return true;
  if (e.status === 401) return true;
  const msg = (e.message ?? "").toLowerCase();
  return msg.includes("jwt") || msg.includes("token") || msg.includes("session");
}

/* Mensaje genérico no-bloqueante para fallos de guardado (criterio 37). */
export const SAVE_ERROR_MESSAGE = "No se pudo guardar, intenta de nuevo";
export const SESSION_EXPIRED_MESSAGE = "Tu sesión expiró, ingresa de nuevo";
