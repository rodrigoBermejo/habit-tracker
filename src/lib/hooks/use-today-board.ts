"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { useHabits } from "@/lib/hooks/use-habits";
import { getDoneCheckins, bumpBestStreak, upsertCheckin } from "@/lib/api/checkins";
import { currentStreak } from "@/lib/streak";
import { todayLocalISO } from "@/lib/date";
import { SAVE_ERROR_MESSAGE } from "@/lib/supabase/errors";
import type { Habit } from "@/lib/supabase/types";

/*
  Estado del tablero del día: fechas "hecho" por hábito, toggle optimista con
  rollback (criterios 18, 37), best_streak monótono y celebración 7/30 (criterio 23).
*/
export function useTodayBoard() {
  const { user } = useAuth();
  const today = todayLocalISO();
  const key = user ? (["done-checkins", user.id] as const) : null;
  const { data, mutate } = useSWR(key, () => getDoneCheckins(user!.id));
  const { mutate: mutateHabits } = useHabits();

  const rows = useMemo(() => data ?? [], [data]);
  const doneByHabit = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const r of rows) {
      const set = map.get(r.habit_id) ?? new Set<string>();
      set.add(r.date);
      map.set(r.habit_id, set);
    }
    return map;
  }, [rows]);

  const [pending, setPending] = useState<Set<string>>(new Set());
  const [celebration, setCelebration] = useState<number | null>(null);

  async function toggle(habit: Habit) {
    if (!user) return;
    const set = doneByHabit.get(habit.id) ?? new Set<string>();
    const currentlyDone = set.has(today);
    const next = !currentlyDone;

    const optimistic = next
      ? [...rows, { habit_id: habit.id, date: today }]
      : rows.filter((r) => !(r.habit_id === habit.id && r.date === today));

    setPending((p) => new Set(p).add(habit.id));
    mutate(optimistic, { revalidate: false });

    try {
      await upsertCheckin(habit.id, user.id, today, next);
      if (next) {
        const newSet = new Set(set);
        newSet.add(today);
        const streak = currentStreak(habit, newSet, today);
        await bumpBestStreak(habit.id, streak);
        const prevBest = habit.best_streak ?? 0;
        if (streak >= 30 && prevBest < 30) setCelebration(30);
        else if (streak >= 7 && prevBest < 7) setCelebration(7);
      }
      mutate();
      mutateHabits();
    } catch {
      mutate(rows, { revalidate: false });
      toast.error(SAVE_ERROR_MESSAGE);
    } finally {
      setPending((p) => {
        const n = new Set(p);
        n.delete(habit.id);
        return n;
      });
    }
  }

  return {
    today,
    doneByHabit,
    toggle,
    pending,
    celebration,
    dismissCelebration: () => setCelebration(null),
    loading: !data && !!key,
  };
}
