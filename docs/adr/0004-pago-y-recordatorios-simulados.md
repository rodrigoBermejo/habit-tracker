# ADR-0004 — Pago y recordatorios simulados en local

- **Estado:** Aceptado
- **Fecha:** 2026-05-29
- **Contexto previo:** decisión del usuario (servicios externos), `spec.md` (planes, recordatorios)

## Contexto

La spec describe Stripe Checkout + webhooks para el plan Premium y recordatorios por email vía
un job (Edge Function + cron). Ambos requieren cuentas y secretos de terceros (Stripe, proveedor
de email) que el usuario decidió **no** conectar ahora: solo provee credenciales de **Supabase**.
Necesitamos cumplir los criterios de plan y recordatorios sin servicios externos reales.

## Decisión

- **Pago simulado:** en `/cuenta` se muestra una **pantalla de pago local** (no Stripe). Al
  "pagar", un Route Handler `src/app/api/checkout-sim/route.ts` escribe en `subscriptions` con
  service-role: `status='active'`, `current_period_end = now() + 1 mes`. "Cancelar" pone
  `cancel_at_period_end=true`; "Reactivar" lo revierte. La lógica de lectura del plan (`isPremium`,
  "Premium hasta DD/MM/YYYY", excedente read-only al expirar) es **idéntica** a la que usaría
  Stripe — solo cambia quién escribe la tabla. Criterios 24, 29, 30 se cumplen contra la simulación.
- **Recordatorios simulados:** la lógica vive en `src/lib/reminders.ts` (función pura: dados los
  hábitos con `reminder_hour`, la hora local del usuario y los check-ins de hoy, devuelve qué
  emails tocaría enviar). Un Route Handler `src/app/api/reminders/run` la ejecuta y, en vez de
  enviar email real, **registra** el resultado (tabla `reminder_log` y/o respuesta JSON visible).
  Criterios 31–32 se verifican observando esa salida.

## Cómo se conectarían los reales (camino de migración)

- **Stripe:** reemplazar `api/checkout-sim` por creación de Checkout Session real + un webhook
  `api/stripe/webhook` que escriba la misma tabla `subscriptions` con los mismos campos. El resto
  de la app no cambia (la frontera es la tabla).
- **Email:** reemplazar el "registrar" de `api/reminders/run` por una llamada a un proveedor
  (p. ej. Resend) y mover el disparo a un cron (Supabase Scheduled Function). La función pura
  `reminders.ts` se reutiliza intacta.

## Consecuencias

**Positivas:** la app es 100% funcional en local sin cuentas de terceros; la frontera de
integración (tabla `subscriptions`, función pura `reminders.ts`) está aislada, así que conectar
los servicios reales luego es un cambio acotado.

**Negativas (asumidas):**
- Los criterios 29/30/31 quedan verificados contra una **simulación**, no contra Stripe/email
  reales: no se prueba el manejo real de webhooks, fallos de pago, ni entregabilidad de email.
- `api/checkout-sim` otorga Premium **sin cobrar**: es un endpoint que jamás debe llegar a
  producción tal cual. Queda marcado como solo-desarrollo.
- Mantener dos caminos (simulado/real) implícitamente es deuda hasta que se conecten los reales.
