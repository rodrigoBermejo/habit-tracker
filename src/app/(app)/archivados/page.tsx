"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useArchivedHabits, useHabits } from "@/lib/hooks/use-habits";
import { HabitCard } from "@/components/habits/habit-card";
import { Button } from "@/components/ui/button";
import { HabitLimitError, unarchiveHabit } from "@/lib/api/habits";
import { SAVE_ERROR_MESSAGE } from "@/lib/supabase/errors";

export default function ArchivadosPage() {
  const { habits, isLoading, mutate } = useArchivedHabits();
  const { mutate: mutateActive } = useHabits();
  const [busyId, setBusyId] = useState<string | null>(null);

  async function onUnarchive(id: string) {
    setBusyId(id);
    try {
      await unarchiveHabit(id);
      await Promise.all([mutate(), mutateActive()]);
    } catch (err) {
      toast.error(err instanceof HabitLimitError ? err.message : SAVE_ERROR_MESSAGE);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-neutral-900">Archivados</h1>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-neutral-500">Cargando…</p>
      ) : habits.length === 0 ? (
        <p className="py-10 text-center text-sm text-neutral-500">
          No tienes hábitos archivados.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {habits.map((h) => (
            <div key={h.id} className="opacity-80">
              <HabitCard
                habit={h}
                action={
                  <Button
                    variant="secondary"
                    loading={busyId === h.id}
                    onClick={() => onUnarchive(h.id)}
                  >
                    Desarchivar
                  </Button>
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
