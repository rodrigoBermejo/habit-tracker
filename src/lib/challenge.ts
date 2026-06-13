/*
  Lógica pura del reto Irreemplazable (ADR-0006). Sin I/O. La racha reutiliza la
  lógica diaria de hábitos (`dailyStreak`): avance secuencial y amable — faltar
  días no rompe el reto, solo corta la racha de días consecutivos.
*/
import { dailyStreak } from "@/lib/streak";

export const CHALLENGE_LENGTH = 28;

/** Día actual: la siguiente tarea no completada (1..28, tope 28). */
export function currentDay(completedCount: number): number {
  return Math.min(completedCount + 1, CHALLENGE_LENGTH);
}

/** ¿El reto está terminado? */
export function isChallengeComplete(completedCount: number): boolean {
  return completedCount >= CHALLENGE_LENGTH;
}

/** Avance 0..100 redondeado. */
export function challengeProgress(completedCount: number): number {
  const done = Math.min(completedCount, CHALLENGE_LENGTH);
  return Math.round((done / CHALLENGE_LENGTH) * 100);
}

/** Racha de días consecutivos del reto terminando hoy. */
export function challengeStreak(completedDates: Set<string>, today: string): number {
  return dailyStreak(completedDates, today);
}

export type DayState = "done" | "current" | "locked";

/** 28 celdas de estado para el grid de progreso (`/reto`). */
export function challengeGrid(completedCount: number): { day: number; state: DayState }[] {
  const current = currentDay(completedCount);
  const done = isChallengeComplete(completedCount);
  const cells: { day: number; state: DayState }[] = [];
  for (let day = 1; day <= CHALLENGE_LENGTH; day++) {
    let state: DayState;
    if (day <= completedCount) state = "done";
    else if (day === current && !done) state = "current";
    else state = "locked";
    cells.push({ day, state });
  }
  return cells;
}
