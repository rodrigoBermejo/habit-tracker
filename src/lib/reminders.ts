/*
  Lógica pura de recordatorios (criterios 31, 32). Sin I/O. Dado un conjunto de
  hábitos activos con su hora de recordatorio, la hora local actual del usuario,
  la fecha local de hoy y las fechas "hecho" por hábito, decide qué recordatorios
  tocaría disparar:
   - solo hábitos con reminder_hour no nula (criterio 32),
   - cuya hora ya pasó hoy (HH:MM local actual >= reminder_hour),
   - y que NO están marcados "hecho" hoy (criterio 31).
*/
import type { Habit } from "@/lib/supabase/types";

export type DueReminder = {
  habitId: string;
  name: string;
  subject: string;
};

/** "HH:MM" -> minutos desde medianoche. Acepta "HH:MM" o "HH:MM:SS". */
export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function dueReminders(
  habits: Habit[],
  nowLocalHHMM: string,
  doneTodayByHabit: (habitId: string) => boolean,
): DueReminder[] {
  const nowMin = timeToMinutes(nowLocalHHMM);
  const due: DueReminder[] = [];
  for (const h of habits) {
    if (h.archived_at) continue; // no recordatorios de archivados
    if (!h.reminder_hour) continue; // criterio 32
    if (timeToMinutes(h.reminder_hour) > nowMin) continue; // aún no es la hora
    if (doneTodayByHabit(h.id)) continue; // ya hecho hoy (criterio 31)
    due.push({
      habitId: h.id,
      name: h.name,
      subject: `Recordatorio: ${h.name}`,
    });
  }
  return due;
}
