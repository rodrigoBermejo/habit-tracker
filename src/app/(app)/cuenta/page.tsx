"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import { usePlan } from "@/lib/hooks/use-plan";
import { planAction, type PlanAction } from "@/lib/api/checkout-sim";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { formatDMY, toLocalISO } from "@/lib/date";

export default function AccountPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { subscription, isPremium, mutate } = usePlan();
  const [busy, setBusy] = useState<PlanAction | null>(null);

  async function run(action: PlanAction) {
    setBusy(action);
    try {
      await planAction(action);
      await mutate();
    } catch {
      toast.error("No se pudo actualizar el plan, intenta de nuevo");
    } finally {
      setBusy(null);
    }
  }

  async function logout() {
    await getSupabaseBrowserClient().auth.signOut();
    router.replace("/login");
  }

  const periodEnd = subscription?.current_period_end
    ? formatDMY(toLocalISO(subscription.current_period_end))
    : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Tu cuenta</h1>

      <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-card">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-medium text-neutral-900">Plan</h2>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              isPremium ? "bg-brand-100 text-brand-800" : "bg-neutral-100 text-neutral-600"
            }`}
          >
            {isPremium ? "Premium" : "Free"}
          </span>
        </div>

        {isPremium ? (
          <div className="flex flex-col gap-3">
            {subscription?.cancel_at_period_end ? (
              <>
                <p className="text-base text-neutral-600">
                  Premium hasta {periodEnd}. Al expirar pasarás a Free.
                </p>
                <Button loading={busy === "reactivate"} onClick={() => run("reactivate")}>
                  Reactivar
                </Button>
              </>
            ) : (
              <>
                <p className="text-base text-neutral-600">
                  Premium activo{periodEnd ? ` · renueva el ${periodEnd}` : ""}.
                </p>
                <Button
                  variant="destructive"
                  loading={busy === "cancel"}
                  onClick={() => run("cancel")}
                >
                  Cancelar suscripción
                </Button>
              </>
            )}
            <button
              type="button"
              onClick={() => run("expire")}
              className="self-start text-xs text-neutral-400 hover:underline"
            >
              (simular expiración — dev)
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-base text-neutral-600">
              Hasta 30 hábitos activos y estadísticas. $99/mes.
            </p>
            <Button onClick={() => router.push("/cuenta/checkout")}>Activar Premium</Button>
          </div>
        )}
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-card">
        <h2 className="mb-2 text-lg font-medium text-neutral-900">Sesión</h2>
        <p className="mb-3 text-sm text-neutral-600">{user?.email}</p>
        <Button variant="secondary" onClick={logout}>
          Cerrar sesión
        </Button>
      </section>
    </div>
  );
}
