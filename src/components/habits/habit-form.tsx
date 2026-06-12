"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/field";
import { useAuth } from "@/components/providers/auth-provider";
import {
  DuplicateNameError,
  HabitLimitError,
  createHabit,
  updateHabit,
  type HabitInput,
} from "@/lib/api/habits";
import { SAVE_ERROR_MESSAGE } from "@/lib/supabase/errors";
import type { Habit, HabitFrequency } from "@/lib/supabase/types";

export function HabitForm({
  open,
  onClose,
  habit,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  habit?: Habit | null;
  onSaved: () => void;
}) {
  const { user } = useAuth();
  const isEdit = !!habit;

  const [name, setName] = useState(habit?.name ?? "");
  const [description, setDescription] = useState(habit?.description ?? "");
  const [frequency, setFrequency] = useState<HabitFrequency>(habit?.frequency ?? "diaria");
  const [target, setTarget] = useState<string>(
    habit?.target_per_week ? String(habit.target_per_week) : "3",
  );
  const [reminder, setReminder] = useState(habit?.reminder_hour?.slice(0, 5) ?? "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate(): HabitInput | null {
    const trimmed = name.trim();
    if (trimmed.length < 1 || trimmed.length > 60) {
      setNameError("El nombre debe tener entre 1 y 60 caracteres");
      return null;
    }
    if (description.length > 280) {
      toast.error("La descripción no puede pasar de 280 caracteres");
      return null;
    }
    let targetVal: number | null = null;
    if (frequency === "semanal") {
      const n = Number(target);
      if (!Number.isInteger(n) || n < 1 || n > 7) {
        toast.error("El objetivo semanal debe estar entre 1 y 7");
        return null;
      }
      targetVal = n;
    }
    return {
      name: trimmed,
      description: description.trim() ? description.trim() : null,
      frequency,
      target_per_week: targetVal,
      reminder_hour: reminder ? reminder : null,
    };
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setNameError(null);
    const input = validate();
    if (!input || !user) return;
    setLoading(true);
    try {
      if (isEdit && habit) await updateHabit(habit.id, input);
      else await createHabit(user.id, input);
      onSaved();
      onClose();
    } catch (err) {
      if (err instanceof DuplicateNameError) setNameError(err.message);
      else if (err instanceof HabitLimitError) toast.error(err.message);
      else toast.error(SAVE_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Editar hábito" : "Nuevo hábito"}>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Field label="Nombre" htmlFor="h-name" error={nameError}>
          <Input
            id="h-name"
            value={name}
            maxLength={60}
            required
            invalid={!!nameError}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field
          label="Descripción (opcional)"
          htmlFor="h-desc"
          hint={`${description.length}/280`}
        >
          <Textarea
            id="h-desc"
            rows={2}
            maxLength={280}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <Field label="Frecuencia" htmlFor="h-freq">
          <div className="flex gap-2">
            {(["diaria", "semanal"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFrequency(f)}
                className={`min-h-12 flex-1 rounded-md border px-3 text-sm font-medium capitalize ${
                  frequency === f
                    ? "border-brand-600 bg-brand-50 text-brand-800"
                    : "border-neutral-300 bg-white text-neutral-600"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </Field>

        {frequency === "semanal" && (
          <Field label="Veces por semana" htmlFor="h-target">
            <Input
              id="h-target"
              type="number"
              min={1}
              max={7}
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </Field>
        )}

        <Field label="Recordatorio (opcional)" htmlFor="h-reminder" hint="Hora local">
          <Input
            id="h-reminder"
            type="time"
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
          />
        </Field>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
