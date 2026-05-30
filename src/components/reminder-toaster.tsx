"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { useHabits } from "@/lib/hooks/use-habits";
import { getDoneCheckins } from "@/lib/api/checkins";
import { ensureTimezone, getProfile } from "@/lib/api/profile";
import { dueReminders } from "@/lib/reminders";
import { browserTimezone, todayLocalISO } from "@/lib/date";

/*
  Recordatorios simulados como TOAST (decisión del usuario, ADR-0004). Al cargar
  la app, evalúa los hábitos con hora de recordatorio ya pasada y sin check-in de
  hoy (criterios 31, 32) y muestra un toast por cada uno. Idempotente por día vía
  localStorage para no repetir en cada navegación.
*/
function nowLocalHHMM(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function ReminderToaster() {
  const { user } = useAuth();
  const { habits } = useHabits();

  useEffect(() => {
    if (!user || habits.length === 0) return;
    let cancelled = false;

    (async () => {
      // Captura la zona horaria del navegador si el profile aún tiene el default
      // y no coincide (necesaria para la hora local de recordatorios, ADR-0001).
      try {
        const tz = browserTimezone();
        const profile = await getProfile(user.id);
        if (profile && profile.timezone !== tz) await ensureTimezone(user.id, tz);
      } catch {
        // no bloquear los recordatorios por esto
      }

      const today = todayLocalISO();
      const storageKey = `reminders-shown:${user.id}:${today}`;
      let shown: string[] = [];
      try {
        shown = JSON.parse(localStorage.getItem(storageKey) ?? "[]");
      } catch {
        shown = [];
      }

      const done = await getDoneCheckins(user.id);
      if (cancelled) return;
      const doneToday = new Set(
        done.filter((d) => d.date === today).map((d) => d.habit_id),
      );

      const due = dueReminders(habits, nowLocalHHMM(), (id) => doneToday.has(id));
      const fresh = due.filter((r) => !shown.includes(r.habitId));
      if (fresh.length === 0) return;

      for (const r of fresh) {
        toast(r.subject, { description: "No olvides marcarlo hoy." });
      }
      localStorage.setItem(
        storageKey,
        JSON.stringify([...shown, ...fresh.map((r) => r.habitId)]),
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [user, habits]);

  return null;
}
