"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useHabits } from "@/lib/hooks/use-habits";
import { usePlan } from "@/lib/hooks/use-plan";
import { HabitCard } from "@/components/habits/habit-card";
import { HabitForm } from "@/components/habits/habit-form";
import { LimitModal } from "@/components/habits/limit-modal";
import { Button } from "@/components/ui/button";
import { todayLocalISO } from "@/lib/date";

function TodayInner() {
  const params = useSearchParams();
  const { habits, isLoading, mutate } = useHabits();
  const { isPremium, habitLimit } = usePlan();

  const [formOpen, setFormOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);

  // Abre el formulario si venimos del onboarding (/?nuevo=1).
  useEffect(() => {
    if (params.get("nuevo") === "1") setFormOpen(true);
  }, [params]);

  function onNew() {
    if (habits.length >= habitLimit) setLimitOpen(true);
    else setFormOpen(true);
  }

  const today = new Date(todayLocalISO() + "T00:00:00");
  const fecha = today.toLocaleDateString("es-MX", {
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
        <Button onClick={onNew} className="shrink-0">
          + Nuevo hábito
        </Button>
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-neutral-500">Cargando…</p>
      ) : habits.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-lg font-medium text-neutral-800">Aún no tienes hábitos</p>
          <p className="text-sm text-neutral-500">Crea tu primer hábito para empezar.</p>
          <Button onClick={onNew}>Crear hábito</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {habits.map((h) => (
            <HabitCard key={h.id} habit={h} />
          ))}
        </div>
      )}

      {formOpen && (
        <HabitForm
          open={formOpen}
          onClose={() => setFormOpen(false)}
          onSaved={() => mutate()}
        />
      )}
      <LimitModal open={limitOpen} onClose={() => setLimitOpen(false)} isPremium={isPremium} />
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
