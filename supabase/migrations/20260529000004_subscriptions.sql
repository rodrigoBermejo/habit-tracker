-- ADR-0001 / ADR-0004: estado de plan (escrito por el pago simulado vía
-- service-role) y bitácora de recordatorios simulados.

create type public.plan_status as enum (
  'active', 'trialing', 'past_due', 'canceled', 'incomplete', 'none'
);

create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status public.plan_status not null default 'none',
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Registro de recordatorios "enviados" (simulación local, ADR-0004).
-- Único por (habit_id, date) para idempotencia: máx. un recordatorio por día.
create table public.reminder_log (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  subject text not null,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);

create index reminder_log_user on public.reminder_log (user_id);
