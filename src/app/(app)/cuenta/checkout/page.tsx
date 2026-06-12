"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePlan } from "@/lib/hooks/use-plan";
import { planAction } from "@/lib/api/checkout-sim";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

/*
  Pantalla de pago SIMULADA (ADR-0004). No cobra ni usa Stripe: al "pagar" llama
  al endpoint local que marca la suscripción como Premium (criterio 29). Los
  campos de tarjeta son decorativos para que el flujo se sienta real.
*/
export default function CheckoutPage() {
  const router = useRouter();
  const { mutate } = usePlan();
  const [loading, setLoading] = useState(false);
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvc, setCvc] = useState("");

  async function onPay(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await planAction("activate");
      await mutate();
      toast.success("¡Listo! Ya eres Premium");
      router.replace("/cuenta");
    } catch {
      toast.error("No se pudo procesar el pago, intenta de nuevo");
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-sm text-brand-700 hover:underline"
        >
          ← Volver
        </button>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-900">Activar Premium</h1>
        <p className="text-sm text-neutral-500">$99 MXN / mes · cancela cuando quieras</p>
      </div>

      <div className="rounded-lg border border-warning-fg/30 bg-warning-bg px-4 py-3 text-sm text-warning-fg">
        Pago simulado: este checkout es de demostración y no realiza ningún cobro real.
      </div>

      <form
        onSubmit={onPay}
        className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-card"
      >
        <Field label="Número de tarjeta" htmlFor="card">
          <Input
            id="card"
            inputMode="numeric"
            placeholder="4242 4242 4242 4242"
            value={card}
            onChange={(e) => setCard(e.target.value)}
            required
          />
        </Field>
        <div className="flex gap-3">
          <Field label="Vence" htmlFor="exp">
            <Input
              id="exp"
              placeholder="MM/AA"
              value={exp}
              onChange={(e) => setExp(e.target.value)}
              required
            />
          </Field>
          <Field label="CVC" htmlFor="cvc">
            <Input
              id="cvc"
              inputMode="numeric"
              placeholder="123"
              value={cvc}
              onChange={(e) => setCvc(e.target.value)}
              required
            />
          </Field>
        </div>
        <Button type="submit" loading={loading}>
          Pagar $99 y activar
        </Button>
      </form>
    </div>
  );
}
