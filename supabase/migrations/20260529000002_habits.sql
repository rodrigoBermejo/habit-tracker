-- ADR-0001: hábitos con frecuencia diaria/semanal, archivado reversible,
-- mejor racha denormalizada y hora de recordatorio opcional.

create type public.habit_frequency as enum ('diaria', 'semanal');

create table public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  description text,
  frequency public.habit_frequency not null,
  target_per_week int,
  reminder_hour time,
  best_streak int not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  constraint habits_name_len check (char_length(btrim(name)) between 1 and 60),
  constraint habits_desc_len check (
    description is null or char_length(description) <= 280
  ),
  constraint habits_target_range check (
    target_per_week is null or target_per_week between 1 and 7
  ),
  -- target_per_week obligatorio en semanal, prohibido en diaria
  constraint habits_target_coherence check (
    (frequency = 'semanal' and target_per_week is not null)
    or (frequency = 'diaria' and target_per_week is null)
  )
);

-- Unicidad de nombre entre hábitos activos, case-insensitive (criterio 14).
create unique index habits_user_name_active
on public.habits (user_id, lower(btrim(name)))
where archived_at is null;

create index habits_user_active
on public.habits (user_id)
where archived_at is null;
