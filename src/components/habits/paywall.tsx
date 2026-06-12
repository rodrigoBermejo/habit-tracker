"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/* Paywall de estadísticas para Free (criterio 24). */
export function Paywall() {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-brand-100 text-2xl">
        ★
      </div>
      <h1 className="text-2xl font-semibold text-neutral-900">Estadísticas es premium</h1>
      <p className="max-w-sm text-base text-neutral-600">
        Sube a Premium para ver tu porcentaje de cumplimiento y tu mejor racha por hábito.
      </p>
      <Button onClick={() => router.push("/cuenta")}>Activar Premium</Button>
    </div>
  );
}
