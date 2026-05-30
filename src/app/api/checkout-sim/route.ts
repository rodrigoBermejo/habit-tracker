import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { PlanStatus } from "@/lib/supabase/types";

/*
  Pago SIMULADO (ADR-0004). NO usa Stripe: escribe directamente subscriptions
  con service-role tras verificar el token del usuario. Este endpoint otorga
  Premium sin cobrar y JAMÁS debe llegar a producción tal cual.

  Acciones:
   - activate:  Premium por 1 mes (criterio 29)
   - cancel:    marca cancel_at_period_end (sigue Premium hasta el fin, criterio 30)
   - reactivate: quita la cancelación / renueva
   - expire:    (dev) fuerza el vencimiento para probar el excedente read-only
*/
type Action = "activate" | "cancel" | "reactivate" | "expire";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const admin = getSupabaseAdminClient();
  const {
    data: { user },
    error: userError,
  } = await admin.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }

  let action: Action;
  try {
    const body = (await request.json()) as { action?: Action };
    if (!body.action) throw new Error("missing action");
    action = body.action;
  } catch {
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  const now = new Date();
  const inOneMonth = new Date(now);
  inOneMonth.setMonth(inOneMonth.getMonth() + 1);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  let status: PlanStatus;
  let currentPeriodEnd: string | null;
  let cancelAtPeriodEnd: boolean;

  switch (action) {
    case "activate":
    case "reactivate":
      status = "active";
      currentPeriodEnd = inOneMonth.toISOString();
      cancelAtPeriodEnd = false;
      break;
    case "cancel":
      status = "active";
      currentPeriodEnd = inOneMonth.toISOString();
      cancelAtPeriodEnd = true;
      break;
    case "expire":
      status = "canceled";
      currentPeriodEnd = yesterday.toISOString();
      cancelAtPeriodEnd = false;
      break;
    default:
      return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  }

  const { error: upsertError } = await admin.from("subscriptions").upsert(
    {
      user_id: user.id,
      status,
      current_period_end: currentPeriodEnd,
      cancel_at_period_end: cancelAtPeriodEnd,
      updated_at: now.toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (upsertError) {
    return NextResponse.json({ error: "No se pudo actualizar el plan" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status, current_period_end: currentPeriodEnd });
}
