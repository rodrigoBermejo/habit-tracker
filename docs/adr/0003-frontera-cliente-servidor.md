# ADR-0003 — Frontera cliente/servidor

- **Estado:** Aceptado
- **Fecha:** 2026-05-29
- **Contexto previo:** `spec.md` (Ronda 3 — Developer), `AGENTS.md` (estructura de carpetas)

## Contexto

El stack es Next.js 15 App Router. La spec (Ronda 3) ya cerró: **Client Components + cliente
Supabase + SWR**, explícitamente **no** RSC + Server Actions. Hay que formalizar qué corre en
el cliente, qué (poco) corre en el servidor, y resolver una contradicción menor de layout.

## Decisión

- **Datos:** todo lectura/escritura ocurre en el cliente, con el cliente Supabase (anon key)
  contra Postgres protegido por RLS, cacheado con SWR. Las páginas son Client Components
  (`'use client'`).
- **Código de servidor (mínimo):** solo Route Handlers en `src/app/api/` para lo que no puede
  vivir en el navegador porque necesita la **service-role key**:
  - `api/checkout-sim` — pantalla de pago simulada que escribe en `subscriptions` (ADR-0004).
  - `api/reminders/run` — ejecuta la lógica de recordatorios simulados (ADR-0004).
- **Layout de carpetas:** se usa `src/` (init `create-next-app --src-dir`, que la spec exige).
  Los nombres de carpeta de `AGENTS.md` (`app/`, `components/`, `lib/`, `types/`) se interpretan
  **relativos a `src/`**: `src/app/`, `src/components/`, `src/lib/`, `src/lib/supabase/`,
  `src/types/`. `docs/adr/`, `supabase/migrations/` y `.claude/` quedan en la raíz.

## Consecuencias

**Positivas:** una sola fuente de verdad para datos (RLS), sin duplicar lógica server/cliente;
SWR da revalidación y sincronía multi-dispositivo (criterio 18); el servidor solo guarda los
secretos que no deben llegar al navegador.

**Negativas (asumidas):**
- Toda la lógica de datos viaja al cliente: **mayor bundle** y la lógica de negocio es visible
  (no hay secretos en ella, pero sí es inspeccionable).
- Sin SSR de datos, el primer render muestra estados de carga (no hay datos en HTML inicial):
  peor percepción de velocidad inicial, aceptable para esta app.
- La service-role key vive en el servidor (Vercel/local): si una env var se expone por error,
  se salta RLS. Riesgo acotado a los dos route handlers que la usan.
