"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { completeOnboarding, getProfile } from "@/lib/api/profile";
import { enrollInChallenge } from "@/lib/api/challenge";
import { todayLocalISO } from "@/lib/date";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Si el usuario ya completó onboarding, no lo dejes aquí (criterio 8).
  useEffect(() => {
    if (!user) return;
    getProfile(user.id)
      .then((p) => {
        if (p?.onboarded_at) router.replace("/");
      })
      .catch(() => {});
  }, [user, router]);

  async function start() {
    if (!user) return;
    setLoading(true);
    // Inscribe al reto (idempotente: si ya estaba, seguimos) y marca onboarding.
    try {
      await enrollInChallenge(user.id, todayLocalISO());
    } catch {
      // ya inscrito o fallo transitorio: no bloqueamos el arranque
    }
    try {
      await completeOnboarding(user.id);
    } catch {
      // tampoco bloqueamos por la marca de tiempo
    }
    router.replace("/");
  }

  return (
    <div className="flex flex-col items-center gap-6 py-10 text-center">
      <h1 className="text-3xl font-semibold text-neutral-900">
        Vuélvete irreemplazable en 28 días
      </h1>
      <p className="max-w-sm text-base text-neutral-600">
        Una tarea de IA al día. La IA no te va a reemplazar: te va a reemplazar
        alguien que la usa todos los días. Hoy empiezas a ser ese alguien.
      </p>
      <Button onClick={start} loading={loading}>
        Empezar el reto
      </Button>
    </div>
  );
}
