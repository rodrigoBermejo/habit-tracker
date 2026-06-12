/*
  Estadísticas puras (criterios 26-28): % de cumplimiento de los últimos 30 días,
  acotado por created_at y archived_at. Sin I/O.
*/
import { addDaysISO, compareISO, daysBetween, toLocalISO } from "@/lib/date";
import { mondayOf } from "@/lib/streak";
import type { Habit } from "@/lib/supabase/types";

/** Límites de la ventana de 30 días para un hábito (criterio 26). */
export function windowFor(habit: Habit, today: string): { start: string; end: string } {
  const createdLocal = toLocalISO(habit.created_at);
  const start = compareISO(createdLocal, addDaysISO(today, -29)) > 0
    ? createdLocal
    : addDaysISO(today, -29);
  let end = today;
  if (habit.archived_at) {
    const archivedPrev = addDaysISO(toLocalISO(habit.archived_at), -1);
    end = compareISO(archivedPrev, today) < 0 ? archivedPrev : today;
  }
  return { start, end };
}

function countInRange(doneSet: Set<string>, start: string, end: string): number {
  let n = 0;
  for (const d of doneSet) {
    if (compareISO(d, start) >= 0 && compareISO(d, end) <= 0) n++;
  }
  return n;
}

/**
 * % de cumplimiento (0..1) o null si no hay periodo activo en la ventana.
 * Diaria: días hechos / días activos. Semanal: semanas con >=target / semanas activas.
 */
export function completionPct(
  habit: Habit,
  doneSet: Set<string>,
  today: string,
): number | null {
  const { start, end } = windowFor(habit, today);
  if (compareISO(start, end) > 0) return null;

  if (habit.frequency === "diaria") {
    const activeDays = daysBetween(start, end) + 1;
    if (activeDays <= 0) return null;
    return countInRange(doneSet, start, end) / activeDays;
  }

  // Semanal: recorre semanas ISO que solapan la ventana.
  const target = habit.target_per_week ?? 1;
  let week = mondayOf(start);
  let activeWeeks = 0;
  let weeksMet = 0;
  while (compareISO(week, end) <= 0) {
    const weekStart = compareISO(week, start) > 0 ? week : start;
    const weekEndRaw = addDaysISO(week, 6);
    const weekEnd = compareISO(weekEndRaw, end) < 0 ? weekEndRaw : end;
    activeWeeks++;
    if (countInRange(doneSet, weekStart, weekEnd) >= target) weeksMet++;
    week = addDaysISO(week, 7);
  }
  if (activeWeeks === 0) return null;
  return weeksMet / activeWeeks;
}

/** Formatea 0..1 como "NN%" o "—" si es null. */
export function formatPct(pct: number | null): string {
  if (pct === null) return "—";
  return `${Math.round(pct * 100)}%`;
}
