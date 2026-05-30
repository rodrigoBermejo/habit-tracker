# Habit Tracker

App web (PWA) para registrar y dar seguimiento a hábitos diarios y semanales: check-in del día,
rachas, estadísticas premium, y planes Free/Premium. En español, mobile-first.

## Stack
- Next.js 15 (App Router) · TypeScript estricto
- Supabase (Postgres + Auth + RLS)
- Tailwind CSS v4
- Cliente Supabase + SWR (Client Components; ver `docs/adr/0003`)

## Estado
App funcional en local. Auth, CRUD de hábitos, check-in/racha, detalle, estadísticas, planes con
**pago simulado** y recordatorios **por toast** (sin Stripe ni email reales — ver `docs/adr/0004`).

## Requisitos
- Node 18+ y npm
- Un proyecto Supabase con las migraciones de `supabase/migrations/` aplicadas
  (proyecto actual: `ncpdpkkbojwhrzprkxgw`)

## Arranque local

1. Instala dependencias:
   ```bash
   npm install
   ```
2. Crea `.env.local` a partir de `.env.example` y rellena tus claves de Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...        # para pago simulado y recordatorios (service-role)
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
3. (Si la BD está vacía) aplica las migraciones con el MCP de Supabase o la CLI
   (`supabase db push`). Regenera tipos: ver `supabase/README.md`.
4. Levanta el server:
   ```bash
   npm run dev        # http://localhost:3000
   ```

## Scripts
- `npm run dev` — desarrollo
- `npm run build` — build de producción
- `npm run lint` — ESLint

## Verificación
No hay tests automatizados (prohibidos por contrato, ver `AGENTS.md`). Las pruebas son
manuales: `docs/pruebas-manuales.md` (PM-001…PM-037, una por criterio de aceptación de
`spec.md`).

## Documentación
- `spec.md` — especificación y criterios de aceptación
- `AGENTS.md` — contrato del proyecto (stack, gitflow, prohibiciones)
- `docs/adr/` — decisiones de arquitectura (modelo de datos, auth, frontera, simulaciones)
- `docs/diseno.md` — sistema visual · `docs/pruebas-manuales.md` — plan de pruebas
- `CONTEXT.md` — bitácora de ediciones manuales y desviaciones
