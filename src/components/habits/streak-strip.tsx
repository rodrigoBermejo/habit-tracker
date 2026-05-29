"use client";

import { stripCells } from "@/lib/streak";
import type { Habit } from "@/lib/supabase/types";

const cellClass: Record<string, string> = {
  done: "bg-cell-done",
  missed: "bg-cell-missed",
  empty: "bg-cell-empty",
};

/* Franja de 14 días (docs/diseno.md §2.4, criterio 22). */
export function StreakStrip({
  habit,
  doneSet,
  today,
}: {
  habit: Habit;
  doneSet: Set<string>;
  today: string;
}) {
  const cells = stripCells(habit, doneSet, today);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {cells.map((c) => (
          <div
            key={c.date}
            title={c.date}
            className={`aspect-square flex-1 rounded-sm ${cellClass[c.state]} ${
              c.date === today ? "ring-2 ring-brand-600 ring-offset-1" : ""
            }`}
          />
        ))}
      </div>
      <div className="flex gap-3 text-xs text-neutral-500">
        <span className="flex items-center gap-1">
          <span className="size-3 rounded-sm bg-cell-done" /> Hecho
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded-sm bg-cell-missed" /> No hecho
        </span>
        <span className="flex items-center gap-1">
          <span className="size-3 rounded-sm bg-cell-empty" /> Antes de crear
        </span>
      </div>
    </div>
  );
}
