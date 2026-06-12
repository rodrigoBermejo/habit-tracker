"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { getHabitDoneDates } from "@/lib/api/checkins";

/** Conjunto de fechas "hecho" de un hábito (racha + franja). */
export function useHabitDoneDates(habitId: string | null) {
  const key = habitId ? (["habit-done", habitId] as const) : null;
  const { data, error, isLoading, mutate } = useSWR(key, () =>
    getHabitDoneDates(habitId!),
  );
  const doneSet = useMemo(() => new Set(data ?? []), [data]);
  return { doneSet, error, isLoading, mutate };
}
