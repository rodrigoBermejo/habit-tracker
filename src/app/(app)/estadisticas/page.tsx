"use client";

import useSWR from "swr";
import { useAuth } from "@/components/providers/auth-provider";
import { usePlan } from "@/lib/hooks/use-plan";
import { getArchivedHabits, getHabits } from "@/lib/api/habits";
import { getDoneCheckins } from "@/lib/api/checkins";
import { completionPct, formatPct } from "@/lib/stats";
import { frequencyLabel } from "@/components/habits/habit-card";
import { Paywall } from "@/components/habits/paywall";
import { todayLocalISO } from "@/lib/date";
import type { Habit } from "@/lib/supabase/types";

export default function StatsPage() {
  const { user } = useAuth();
  const { isPremium, isLoading: planLoading } = usePlan();

  const key = user && isPremium ? (["stats", user.id] as const) : null;
  const { data, isLoading } = useSWR(key, async () => {
    const [active, archived, done] = await Promise.all([
      getHabits(user!.id),
      getArchivedHabits(user!.id),
      getDoneCheckins(user!.id),
    ]);
    const byHabit = new Map<string, Set<string>>();
    for (const r of done) {
      const set = byHabit.get(r.habit_id) ?? new Set<string>();
      set.add(r.date);
      byHabit.set(r.habit_id, set);
    }
    return { habits: [...active, ...archived] as Habit[], byHabit };
  });

  if (planLoading) {
    return <p className="py-10 text-center text-sm text-neutral-500">Cargando…</p>;
  }
  if (!isPremium) return <Paywall />;

  const today = todayLocalISO();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-neutral-900">Estadísticas</h1>

      {isLoading || !data ? (
        <p className="py-10 text-center text-sm text-neutral-500">Cargando…</p>
      ) : data.habits.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-500">
          Crea un hábito para ver tus estadísticas.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {data.habits.map((h) => {
            const set = data.byHabit.get(h.id) ?? new Set<string>();
            const pct = completionPct(h, set, today);
            return (
              <div
                key={h.id}
                className="rounded-lg border border-neutral-200 bg-white p-4 shadow-card"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-lg font-medium text-neutral-900">{h.name}</p>
                  {h.archived_at && (
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                      Archivado
                    </span>
                  )}
                </div>
                <p className="text-sm text-neutral-500">{frequencyLabel(h)}</p>
                <p className="mt-2 text-3xl font-bold text-brand-700">{formatPct(pct)}</p>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-neutral-200">
                  <div
                    className="h-full bg-brand-500"
                    style={{ width: `${Math.round((pct ?? 0) * 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  Cumplimiento 30 días · Mejor racha: {h.best_streak} días
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
