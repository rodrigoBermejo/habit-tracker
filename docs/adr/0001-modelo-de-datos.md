# ADR-0001 — Modelo de datos

- **Estado:** Aceptado
- **Fecha:** 2026-05-29
- **Contexto previo:** `spec.md` (Ronda 1 — Datos), `AGENTS.md` (decisiones abiertas)

## Contexto

La spec define un tracker de hábitos con registro diario binario, rachas, archivado
reversible, planes Free/Premium y recordatorios por email. El stack de datos es Supabase
(Postgres + Auth) con Row Level Security. La spec ya fijó la mayoría de las reglas de datos
(Ronda 1); este ADR las formaliza y cierra los huecos pendientes (zona horaria para
recordatorios, señal de onboarding).

## Decisión

Cuatro tablas principales, todas con RLS por `auth.uid()`:

### `profiles` (1:1 con `auth.users`)
- `id uuid PK` → `auth.users(id)`.
- `timezone text` (IANA, default `'America/Mexico_City'`) — **necesaria** para que el job de
  recordatorios respete la hora local del usuario (la spec exige hora local pero no persistía
  la TZ; este es el hueco que cerramos).
- `onboarded_at timestamptz null` — distingue post-signup (→ `/onboarding`) de post-login
  (→ `/`), criterios 7–8.
- Trigger `handle_new_user` crea el `profiles` al insertarse un `auth.users`.

### `habits`
- `id uuid PK`, `user_id uuid` → `auth.users`.
- `name text` (1–60 chars, trim), `description text` (0–280, opcional).
- `frequency` enum (`diaria` | `semanal`); `target_per_week int` (1–7, **NULL en diaria**,
  obligatorio en semanal — constraint de coherencia).
- `reminder_hour time null` (NULL = sin recordatorio, criterio 32).
- `best_streak int default 0` (denormalizado, actualizado monótonamente por el toggle).
- `archived_at timestamptz null` (soft-delete reversible).
- `created_at timestamptz default now()`.
- Índice único parcial `(user_id, lower(name)) WHERE archived_at IS NULL` → unicidad de
  nombre **entre activos**, case-insensitive (criterio 14).

### `checkins`
- `id uuid PK`, `habit_id` → `habits`, `user_id uuid` (**denormalizado** para que la policy
  RLS sea un predicado de una sola tabla, sin join).
- `date date` (calculada en el cliente con la TZ del navegador), `done boolean`.
- `UNIQUE(habit_id, date)` → un registro por hábito y día; el toggle es un UPSERT (criterio 18).
- Trigger que rechaza insert/update si el hábito está archivado (criterio 17).

### `subscriptions`
- `user_id uuid PK` → `auth.users`.
- `status` enum (`active|trialing|past_due|canceled|incomplete|none`), `current_period_end
  timestamptz`, `cancel_at_period_end boolean`.
- Lectura por el dueño; escritura solo por service-role (la pantalla de pago simulada,
  ADR-0004). `isPremium` = `status in ('active','trialing') AND current_period_end > now()`.

### Reglas de racha (cerradas aquí)
- **Diaria:** cuenta días consecutivos con `done=true` terminando **hoy**; si hoy no está
  hecho, racha = 0 (lectura estricta del criterio 20).
- **Semanal:** semana ISO con inicio lunes; cuenta semanas consecutivas con ≥`target_per_week`
  check-ins, terminando en la semana actual o la anterior (la semana actual sin alcanzar target
  aún no rompe la racha).

## Consecuencias

**Positivas:** RLS simple y barata (predicado de columna, sin joins); constraints garantizan
integridad en la base, no solo en el cliente; `best_streak` denormalizado evita recálculo caro
en `/estadisticas`.

**Negativas (asumidas):**
- `user_id` denormalizado en `checkins` introduce **redundancia** que hay que mantener
  consistente (se setea en el insert; un `user_id` equivocado quedaría oculto por RLS pero es
  deuda).
- `best_streak` denormalizado puede **desincronizarse** si un toggle falla a medias; se mitiga
  con update monótono `greatest(best_streak, nuevo)`, pero no recalcula a la baja.
- Añadir `profiles.timezone` y `onboarded_at` son columnas que la spec original no contemplaba:
  **desviación documentada** respecto al spec (hueco real, no capricho).
