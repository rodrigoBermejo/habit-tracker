"use client";

import { useState } from "react";
import { useHabits } from "@/lib/hooks/use-habits";
import { usePlan } from "@/lib/hooks/use-plan";
import { useTodayBoard } from "@/lib/hooks/use-today-board";
import { useOnline } from "@/lib/use-online";
import { ChallengeHero } from "@/components/challenge/challenge-hero";
import { HabitCard, frequencyLabel } from "@/components/habits/habit-card";
import { HabitForm } from "@/components/habits/habit-form";
import { LimitModal } from "@/components/habits/limit-modal";
import { CheckinToggle } from "@/components/habits/checkin-toggle";
import { CelebrationModal } from "@/components/habits/celebration-modal";
import { Button } from "@/components/ui/button";
import { currentStreak } from "@/lib/streak";

function streakLabel(streak: number): string {
  if (streak === 0) return "Empieza hoy";
  return `Racha: ${streak} ${streak === 1 ? "día" : "días"}`;
}

export default function TodayPage() {
  const online = useOnline();
  const { habits, isLoading, mutate } = useHabits();
  const { isPremium, habitLimit } = usePlan();
  const { doneByHabit, toggle, pending, today, celebration, dismissCelebration } =
    useTodayBoard();

  const [formOpen, setFormOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);

  function onNew() {
    if (habits.length >= habitLimit) setLimitOpen(true);
    else setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Reto-first: la tarea del día es lo primero (ADR-0006). */}
      <ChallengeHero />

      {/* Tracker libre de hábitos, secundario. */}
      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-2">
          <h2 className="text-xl font-semibold text-neutral-900">Mis hábitos</h2>
          <Button
            onClick={onNew}
            variant="secondary"
            className="shrink-0"
            disabled={!online}
          >
            + Nuevo
          </Button>
        </div>

        {isLoading ? (
          <p className="py-6 text-center text-sm text-neutral-500">Cargando…</p>
        ) : habits.length === 0 ? (
          <p className="rounded-lg border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500">
            Sostén la práctica más allá del reto: crea tu primer hábito.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {habits.map((h, index) => {
              const set = doneByHabit.get(h.id) ?? new Set<string>();
              const streak = currentStreak(h, set, today);
              const isExcess = !isPremium && index >= habitLimit;
              const subtitle = isExcess
                ? "Premium para activar este hábito"
                : `${frequencyLabel(h)} · ${streakLabel(streak)}`;
              return (
                <HabitCard
                  key={h.id}
                  habit={h}
                  subtitle={subtitle}
                  action={
                    <CheckinToggle
                      done={set.has(today)}
                      loading={pending.has(h.id)}
                      disabled={!online || isExcess}
                      onToggle={() => toggle(h)}
                    />
                  }
                />
              );
            })}
          </div>
        )}
      </section>

      {formOpen && (
        <HabitForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => mutate()} />
      )}
      <LimitModal open={limitOpen} onClose={() => setLimitOpen(false)} isPremium={isPremium} />
      <CelebrationModal streak={celebration} onClose={dismissCelebration} />
    </div>
  );
}
