"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Habit } from "@/lib/supabase/types";

export function frequencyLabel(habit: Habit): string {
  return habit.frequency === "semanal"
    ? `Semanal · ${habit.target_per_week}/sem`
    : "Diario";
}

/* Card de hábito (docs/diseno.md §2.2). `action` es el slot del toggle (Fase 7). */
export function HabitCard({
  habit,
  subtitle,
  action,
}: {
  habit: Habit;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-card">
      <Link href={`/habito/${habit.id}`} className="min-w-0 flex-1">
        <p className="truncate text-lg font-medium text-neutral-900">{habit.name}</p>
        <p className="text-sm text-neutral-500">{subtitle ?? frequencyLabel(habit)}</p>
      </Link>
      {action}
    </div>
  );
}
