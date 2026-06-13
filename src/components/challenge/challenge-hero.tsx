"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { useChallenge } from "@/lib/hooks/use-challenge";
import { useOnline } from "@/lib/use-online";
import { completeDay, enrollInChallenge } from "@/lib/api/challenge";
import { todayLocalISO } from "@/lib/date";
import { Button } from "@/components/ui/button";

/* Hero del reto Irreemplazable en `/` (reto-first, ADR-0006). Maneja los cuatro
   estados: sin inscribir, en curso, ya cumplió hoy, y reto terminado. */
export function ChallengeHero() {
  const { user } = useAuth();
  const online = useOnline();
  const c = useChallenge();
  const [busy, setBusy] = useState(false);

  if (c.isLoading) {
    return (
      <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card">
        <p className="text-sm text-neutral-500">Cargando el reto…</p>
      </section>
    );
  }

  async function enroll() {
    if (!user) return;
    setBusy(true);
    try {
      await enrollInChallenge(user.id, todayLocalISO());
      await c.mutate();
    } catch {
      toast.error("No se pudo empezar el reto, intenta de nuevo");
    } finally {
      setBusy(false);
    }
  }

  async function complete() {
    if (!user) return;
    setBusy(true);
    try {
      await completeDay(user.id, c.currentDay, todayLocalISO());
      await c.mutate();
    } catch {
      toast.error("No se pudo guardar, intenta de nuevo");
    } finally {
      setBusy(false);
    }
  }

  if (!c.enrolled) {
    return (
      <section className="rounded-xl border border-brand-200 bg-brand-50 p-5 shadow-card">
        <p className="text-sm font-medium text-brand-700">El Reto Irreemplazable</p>
        <h2 className="mt-1 text-xl font-semibold text-neutral-900">
          28 días para volverte irreemplazable con IA
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Una tarea de IA al día. La IA no te va a reemplazar: te va a reemplazar
          alguien que la usa todos los días. Ponte perro.
        </p>
        <Button onClick={enroll} loading={busy} disabled={!online} className="mt-4 w-full">
          Empezar el reto
        </Button>
      </section>
    );
  }

  if (c.completed) {
    return (
      <section className="rounded-xl border border-brand-200 bg-brand-50 p-5 text-center shadow-card">
        <p className="text-3xl font-bold text-brand-700">28/28</p>
        <h2 className="mt-2 text-xl font-semibold text-neutral-900">¡Eres irreemplazable!</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Terminaste los 28 días. Ahora sostén la práctica con tus hábitos.
        </p>
        <Link
          href="/reto"
          className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline"
        >
          Ver mi progreso
        </Link>
      </section>
    );
  }

  const task = c.todayTask;
  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-brand-700">
          Día {c.currentDay} de {c.total}
        </span>
        <span className="text-neutral-500">
          {c.streak > 0 ? `Racha: ${c.streak} ${c.streak === 1 ? "día" : "días"}` : "Empieza hoy"}
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${c.progress}%` }} />
      </div>

      {c.doneToday ? (
        <div className="mt-4 text-center">
          <p className="text-base font-medium text-neutral-800">Ya le diste hoy.</p>
          <p className="mt-1 text-sm text-neutral-500">
            Vuelve mañana por el día {c.currentDay}. No aflojes.
          </p>
        </div>
      ) : task ? (
        <>
          <h2 className="mt-4 text-lg font-semibold text-neutral-900">{task.title}</h2>
          <p className="mt-1 text-sm text-neutral-600">{task.prompt}</p>
          {task.tip && (
            <p className="mt-2 text-sm text-neutral-500">
              <span className="font-medium">Tip:</span> {task.tip}
            </p>
          )}
          <Button onClick={complete} loading={busy} disabled={!online} className="mt-4 w-full">
            Hecho
          </Button>
        </>
      ) : null}

      <Link
        href="/reto"
        className="mt-3 block text-center text-sm text-neutral-500 hover:text-neutral-800"
      >
        Ver progreso del reto
      </Link>
    </section>
  );
}
