"use client";

import Link from "next/link";
import { useChallenge } from "@/lib/hooks/use-challenge";
import { challengeGrid, type DayState } from "@/lib/challenge";

const cellStyle: Record<DayState, string> = {
  done: "bg-cell-done text-white",
  current: "bg-white text-brand-700 ring-2 ring-brand-600",
  locked: "bg-neutral-100 text-neutral-400",
};

export default function RetoPage() {
  const c = useChallenge();

  if (c.isLoading) {
    return <p className="py-10 text-center text-sm text-neutral-500">Cargando…</p>;
  }

  if (!c.enrolled) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-lg font-medium text-neutral-800">Aún no empiezas el reto</p>
        <Link href="/" className="text-sm font-medium text-brand-700 hover:underline">
          Empezar el reto de 28 días
        </Link>
      </div>
    );
  }

  const grid = challengeGrid(c.completedCount);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">El Reto</h1>
        <p className="text-sm text-neutral-500">28 días para volverte irreemplazable con IA</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Día" value={`${c.completed ? c.total : c.currentDay}/${c.total}`} />
        <Stat label="Racha" value={`${c.streak}`} />
        <Stat label="Avance" value={`${c.progress}%`} />
      </div>

      <div className="grid grid-cols-7 gap-2">
        {grid.map(({ day, state }) => (
          <div
            key={day}
            className={`flex aspect-square items-center justify-center rounded-md text-sm font-medium ${cellStyle[state]}`}
            title={`Día ${day}`}
          >
            {day}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-neutral-500">
        <Legend className="bg-cell-done" label="Completado" />
        <Legend className="bg-white ring-2 ring-brand-600" label="Hoy" />
        <Legend className="bg-neutral-100" label="Bloqueado" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-3 text-center shadow-card">
      <p className="text-2xl font-bold text-brand-700">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  );
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`inline-block size-3 rounded ${className}`} />
      {label}
    </span>
  );
}
