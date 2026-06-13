"use client";

import useSWR from "swr";
import { useAuth } from "@/components/providers/auth-provider";
import { getChallengeTasks, getEnrollment, getCompletions } from "@/lib/api/challenge";
import {
  CHALLENGE_LENGTH,
  challengeProgress,
  challengeStreak,
  currentDay,
  isChallengeComplete,
} from "@/lib/challenge";
import { todayLocalISO } from "@/lib/date";

/* Estado del reto Irreemplazable: tareas (global), inscripción y completados del
   usuario, más derivados (día actual, tarea de hoy, racha, avance). */
export function useChallenge() {
  const { user } = useAuth();
  const key = user ? (["challenge", user.id] as const) : null;
  const { data, error, isLoading, mutate } = useSWR(key, async () => {
    const [tasks, enrollment, completions] = await Promise.all([
      getChallengeTasks(),
      getEnrollment(user!.id),
      getCompletions(user!.id),
    ]);
    return { tasks, enrollment, completions };
  });

  const tasks = data?.tasks ?? [];
  const enrollment = data?.enrollment ?? null;
  const completions = data?.completions ?? [];
  const completedCount = completions.length;
  const today = todayLocalISO();
  const completedDates = new Set(completions.map((c) => c.completed_on));

  const day = currentDay(completedCount);
  const completed = isChallengeComplete(completedCount);
  const doneToday = completedDates.has(today);

  return {
    enrolled: !!enrollment,
    enrollment,
    tasks,
    completions,
    completedCount,
    currentDay: day,
    todayTask: tasks.find((t) => t.day_number === day) ?? null,
    streak: challengeStreak(completedDates, today),
    progress: challengeProgress(completedCount),
    completed,
    doneToday,
    total: CHALLENGE_LENGTH,
    error,
    isLoading,
    mutate,
  };
}
