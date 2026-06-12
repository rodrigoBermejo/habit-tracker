"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useHabits } from "@/lib/hooks/use-habits";
import { usePlan } from "@/lib/hooks/use-plan";
import { useTodayBoard } from "@/lib/hooks/use-today-board";
import { useOnline } from "@/lib/use-online";
import { HabitCard, frequencyLabel } from "@/components/habits/habit-card";
import { HabitForm } from "@/components/habits/habit-form";
import { LimitModal } from "@/components/habits/limit-modal";
import { CheckinToggle } from "@/components/habits/checkin-toggle";
import { CelebrationModal } from "@/components/habits/celebration-modal";
import { Button } from "@/components/ui/button";
import { currentStreak } from "@/lib/streak";
import { todayLocalISO } from "@/lib/date";

function streakLabel(streak: number): string {
  if (streak === 0) return "Empieza hoy";
  return `Racha: ${streak} ${streak === 1 ? "día" : "días"}`;
}

function TodayInner() {
  const params = useSearchParams();
  const online = useOnline();
  const { habits, isLoading, mutate } = useHabits();
  const { isPremium, habitLimit } = usePlan();
  const { doneByHabit, toggle, pending, today, celebration, dismissCelebration } =
    useTodayBoard();

  const [formOpen, setFormOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);

  useEffect(() => {
    if (params.get("nuevo") === "1") setFormOpen(true);
  }, [params]);

  function onNew() {
    if (habits.length >= habitLimit) setLimitOpen(true);
    else setFormOpen(true);
  }

  const fecha = new Date(todayLocalISO() + "T00:00:00").toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Hoy</h1>
          <p className="text-sm text-neutral-500 first-letter:uppercase">{fecha}</p>
        </div>
        <Button onClick={onNew} className="shrink-0" disabled={!online}>
          + Nuevo hábito
        </Button>
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-neutral-500">Cargando…</p>
      ) : habits.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-lg font-medium text-neutral-800">Aún no tienes hábitos</p>
          <p className="text-sm text-neutral-500">Crea tu primer hábito para empezar.</p>
          <Button onClick={onNew} disabled={!online}>
            Crear hábito
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {habits.map((h, index) => {
            const set = doneByHabit.get(h.id) ?? new Set<string>();
            const streak = currentStreak(h, set, today);
            // Excedente read-only tras expirar Premium (criterio 30): solo los
            // primeros `habitLimit` (3 en Free) quedan editables; el resto, bloqueados.
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

      {formOpen && (
        <HabitForm open={formOpen} onClose={() => setFormOpen(false)} onSaved={() => mutate()} />
      )}
      <LimitModal open={limitOpen} onClose={() => setLimitOpen(false)} isPremium={isPremium} />
      <CelebrationModal streak={celebration} onClose={dismissCelebration} />
    </div>
  );
}

export default function TodayPage() {
  return (
    <Suspense fallback={null}>
      <TodayInner />
    </Suspense>
  );
}
