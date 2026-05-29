/*
  Lógica pura de rachas y franja (docs/adr/0001, criterios 19-22). Sin I/O.
  "today" siempre es la fecha local (YYYY-MM-DD) que pasa quien llama.
*/
import { addDaysISO, compareISO, toLocalISO } from "@/lib/date";
import type { Habit } from "@/lib/supabase/types";

/** Lunes (YYYY-MM-DD) de la semana ISO que contiene a `iso`. */
export function mondayOf(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const dayFromMonday = (date.getDay() + 6) % 7; // 0 = lunes
  date.setDate(date.getDate() - dayFromMonday);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

/** Racha diaria: días consecutivos con "hecho" terminando hoy (criterio 20). */
export function dailyStreak(doneDates: Set<string>, today: string): number {
  let streak = 0;
  let cursor = today;
  while (doneDates.has(cursor)) {
    streak++;
    cursor = addDaysISO(cursor, -1);
  }
  return streak;
}

/** Cuenta "hechos" por semana (clave = lunes ISO). */
export function countByWeek(doneDates: Set<string>): Map<string, number> {
  const counts = new Map<string, number>();
  for (const d of doneDates) {
    const key = mondayOf(d);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

/**
 * Racha semanal: semanas consecutivas con >= target "hechos", terminando en la
 * semana actual o la anterior (criterio 21). La semana actual sin alcanzar el
 * target todavía no rompe la racha.
 */
export function weeklyStreak(
  doneDates: Set<string>,
  target: number,
  today: string,
): number {
  const counts = countByWeek(doneDates);
  let week = mondayOf(today);
  if ((counts.get(week) ?? 0) < target) {
    week = addDaysISO(week, -7); // gracia para la semana en curso
  }
  let streak = 0;
  while ((counts.get(week) ?? 0) >= target) {
    streak++;
    week = addDaysISO(week, -7);
  }
  return streak;
}

/** Racha actual según la frecuencia del hábito. */
export function currentStreak(
  habit: Pick<Habit, "frequency" | "target_per_week">,
  doneDates: Set<string>,
  today: string,
): number {
  if (habit.frequency === "semanal") {
    return weeklyStreak(doneDates, habit.target_per_week ?? 1, today);
  }
  return dailyStreak(doneDates, today);
}

export type StripCell = "done" | "missed" | "empty";

/** 14 celdas de más antigua a hoy (criterio 22). */
export function stripCells(
  habit: Pick<Habit, "created_at">,
  doneDates: Set<string>,
  today: string,
): { date: string; state: StripCell }[] {
  const createdLocal = toLocalISO(habit.created_at);
  const cells: { date: string; state: StripCell }[] = [];
  for (let offset = 13; offset >= 0; offset--) {
    const date = addDaysISO(today, -offset);
    let state: StripCell;
    if (compareISO(date, createdLocal) < 0) state = "empty";
    else state = doneDates.has(date) ? "done" : "missed";
    cells.push({ date, state });
  }
  return cells;
}
