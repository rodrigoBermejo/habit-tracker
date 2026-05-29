-- ADR-0001: registro diario binario. user_id denormalizado para que RLS sea un
-- predicado de una sola tabla. Único por (habit_id, date); el toggle es UPSERT.

create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid not null references public.habits (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  done boolean not null default true,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);

create index checkins_habit_date on public.checkins (habit_id, date);

-- Rechaza marcar hecho/no-hecho en un hábito archivado (criterio 17).
-- errcode check_violation (23514) -> PostgREST responde HTTP 400.
create or replace function public.reject_checkin_on_archived()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  h_archived timestamptz;
begin
  select archived_at into h_archived
  from public.habits
  where id = new.habit_id;

  if h_archived is not null then
    raise exception 'Hábito archivado' using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger checkins_reject_archived
before insert or update on public.checkins
for each row execute function public.reject_checkin_on_archived();
