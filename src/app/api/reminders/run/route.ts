import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { dueReminders } from "@/lib/reminders";
import type { Habit } from "@/lib/supabase/types";

/*
  Recordatorios simulados — endpoint de bitácora (ADR-0004). NO envía email:
  ejecuta la lógica pura para el usuario autenticado y registra en reminder_log
  (idempotente por (habit_id, date)). Devuelve la lista para inspección manual.
  El parámetro `now` (HH:MM, opcional) permite probar a una hora distinta.
*/
export async function POST(request: Request) {
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const admin = getSupabaseAdminClient();
  const {
    data: { user },
    error: userError,
  } = await admin.auth.getUser(token);
  if (userError || !user) {
    return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
  }

  let nowHHMM: string;
  let today: string;
  try {
    const body = (await request.json().catch(() => ({}))) as { now?: string; today?: string };
    const d = new Date();
    nowHHMM =
      body.now ??
      `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    today =
      body.today ??
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  } catch {
    return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
  }

  const { data: habits, error: habitsError } = await admin
    .from("habits")
    .select("*")
    .eq("user_id", user.id)
    .is("archived_at", null);
  if (habitsError) {
    return NextResponse.json({ error: "No se pudieron leer los hábitos" }, { status: 500 });
  }

  const { data: doneRows } = await admin
    .from("checkins")
    .select("habit_id")
    .eq("user_id", user.id)
    .eq("date", today)
    .eq("done", true);
  const doneToday = new Set((doneRows ?? []).map((r) => r.habit_id));

  const due = dueReminders(
    (habits ?? []) as Habit[],
    nowHHMM,
    (id) => doneToday.has(id),
  );

  // Registrar en reminder_log (idempotente por (habit_id, date)).
  if (due.length > 0) {
    await admin.from("reminder_log").upsert(
      due.map((r) => ({
        habit_id: r.habitId,
        user_id: user.id,
        date: today,
        subject: r.subject,
      })),
      { onConflict: "habit_id,date" },
    );
  }

  return NextResponse.json({ ok: true, date: today, now: nowHHMM, reminders: due });
}
