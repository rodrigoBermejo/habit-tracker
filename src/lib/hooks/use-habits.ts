"use client";

import useSWR from "swr";
import { useAuth } from "@/components/providers/auth-provider";
import { getArchivedHabits, getHabit, getHabits } from "@/lib/api/habits";

export function useHabits() {
  const { user } = useAuth();
  const key = user ? (["habits", user.id] as const) : null;
  const { data, error, isLoading, mutate } = useSWR(key, () => getHabits(user!.id));
  return { habits: data ?? [], error, isLoading, mutate };
}

export function useArchivedHabits() {
  const { user } = useAuth();
  const key = user ? (["habits-archived", user.id] as const) : null;
  const { data, error, isLoading, mutate } = useSWR(key, () =>
    getArchivedHabits(user!.id),
  );
  return { habits: data ?? [], error, isLoading, mutate };
}

export function useHabit(id: string | null) {
  const key = id ? (["habit", id] as const) : null;
  const { data, error, isLoading, mutate } = useSWR(key, () => getHabit(id!));
  return { habit: data ?? null, error, isLoading, mutate };
}
