"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useHabit } from "@/lib/hooks/use-habits";
import { useHabitDoneDates } from "@/lib/hooks/use-habit-checkins";
import { frequencyLabel } from "@/components/habits/habit-card";
import { StreakStrip } from "@/components/habits/streak-strip";
import { ShareButton } from "@/components/habits/share-button";
import { HabitForm } from "@/components/habits/habit-form";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { currentStreak } from "@/lib/streak";
import { todayLocalISO } from "@/lib/date";
import { archiveHabit } from "@/lib/api/habits";
import { SAVE_ERROR_MESSAGE } from "@/lib/supabase/errors";

export default function HabitDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { habit, isLoading, mutate } = useHabit(id);
  const { doneSet, isLoading: loadingDates, mutate: mutateDates } = useHabitDoneDates(id);
  const today = todayLocalISO();

  const [editOpen, setEditOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [archiving, setArchiving] = useState(false);

  if (isLoading || loadingDates) {
    return <p className="py-10 text-center text-sm text-neutral-500">Cargando…</p>;
  }

  // Hábito inexistente o de otro usuario (RLS) -> 404 (criterio 33).
  if (!habit) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <h1 className="text-2xl font-semibold text-neutral-900">No encontramos eso</h1>
        <p className="text-sm text-neutral-500">
          El hábito no existe o no es tuyo.
        </p>
        <Link href="/" className="text-brand-700 hover:underline">
          Volver al inicio
        </Link>
      </div>
    );
  }

  const streak = currentStreak(habit, doneSet, today);

  async function onArchive() {
    if (!habit) return;
    setArchiving(true);
    try {
      await archiveHabit(habit.id);
      router.replace("/");
    } catch {
      toast.error(SAVE_ERROR_MESSAGE);
      setArchiving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/" className="text-sm text-brand-700 hover:underline">
          ← Hoy
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-900">{habit.name}</h1>
        <p className="text-sm text-neutral-500">{frequencyLabel(habit)}</p>
        {habit.description && (
          <p className="mt-2 text-base text-neutral-600">{habit.description}</p>
        )}
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-card">
        <p className="text-3xl font-bold text-brand-700">
          {streak === 0 ? "Empieza hoy" : `Racha: ${streak}`}
        </p>
        <p className="text-sm text-neutral-500">Mejor racha: {habit.best_streak} días</p>
      </div>

      <StreakStrip habit={habit} doneSet={doneSet} today={today} />

      <div className="flex flex-wrap gap-2">
        <ShareButton name={habit.name} streak={streak} />
        <Button variant="secondary" onClick={() => setEditOpen(true)}>
          Editar
        </Button>
        <Button variant="destructive" onClick={() => setArchiveOpen(true)}>
          Archivar
        </Button>
      </div>

      {editOpen && (
        <HabitForm
          open={editOpen}
          habit={habit}
          onClose={() => setEditOpen(false)}
          onSaved={() => {
            mutate();
            mutateDates();
          }}
        />
      )}

      <Modal open={archiveOpen} onClose={() => setArchiveOpen(false)} title="¿Archivar hábito?">
        <div className="flex flex-col gap-4">
          <p className="text-base text-neutral-600">
            Dejará de aparecer en Hoy. Podrás desarchivarlo cuando quieras.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setArchiveOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" loading={archiving} onClick={onArchive}>
              Archivar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
