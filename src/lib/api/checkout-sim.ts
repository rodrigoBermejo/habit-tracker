import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type PlanAction = "activate" | "cancel" | "reactivate" | "expire";

/* Llama al endpoint de pago simulado con el token del usuario (ADR-0004). */
export async function planAction(action: PlanAction): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("No autenticado");

  const res = await fetch("/api/checkout-sim", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action }),
  });
  if (!res.ok) throw new Error("No se pudo actualizar el plan");
}
