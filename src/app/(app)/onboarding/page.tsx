"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { completeOnboarding, getProfile } from "@/lib/api/profile";
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
    try {
      await completeOnboarding(user.id);
    } catch {
      // No bloqueamos el onboarding por un fallo al marcar la marca de tiempo.
    }
    router.replace("/?nuevo=1");
  }

  return (
    <div className="flex flex-col items-center gap-6 py-10 text-center">
      <h1 className="text-3xl font-semibold text-neutral-900">
        Empieza un hábito a la vez
      </h1>
      <p className="max-w-sm text-base text-neutral-600">
        Registra lo que quieres sostener, marca tu día y mira crecer tu racha.
        Sin ruido, sin presión. Un día a la vez.
      </p>
      <Button onClick={start} loading={loading}>
        Crear tu primer hábito
      </Button>
    </div>
  );
}
