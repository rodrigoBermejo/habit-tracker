-- ADR-0001/0002/0003: Row Level Security. Cada usuario solo ve y modifica sus
-- propias filas (using auth.uid() = user_id). subscriptions y reminder_log son
-- de solo lectura para el dueño; las escribe el service-role (pago/recordatorios).

alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.checkins enable row level security;
alter table public.subscriptions enable row level security;
alter table public.reminder_log enable row level security;

-- profiles: el dueño gestiona su propia fila
create policy profiles_self on public.profiles
for all using (auth.uid() = id) with check (auth.uid() = id);

-- habits: CRUD del dueño. Sin policy de delete (hard-delete es no-goal).
create policy habits_select on public.habits
for select using (auth.uid() = user_id);
create policy habits_insert on public.habits
for insert with check (auth.uid() = user_id);
create policy habits_update on public.habits
for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- checkins: todo del dueño
create policy checkins_all on public.checkins
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- subscriptions: el dueño lee; escribe el service-role (sin policy de write)
create policy subscriptions_select on public.subscriptions
for select using (auth.uid() = user_id);

-- reminder_log: el dueño lee; escribe el service-role
create policy reminder_log_select on public.reminder_log
for select using (auth.uid() = user_id);

-- Límite de hábitos activos por plan (3 free / 30 premium) en servidor,
-- defensa para inserciones vía API (criterios 10, 12). El cliente además
-- muestra el modal correspondiente. errcode check_violation -> HTTP 400.
-- Nota: se aplica en INSERT; el caso de desarchivar por encima del límite
-- (no especificado en los criterios) se controla en el cliente.
create or replace function public.enforce_habit_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  active_count int;
  is_premium boolean;
  limit_val int;
begin
  -- insertar ya archivado no cuenta contra el límite de activos
  if new.archived_at is not null then
    return new;
  end if;

  select count(*) into active_count
  from public.habits
  where user_id = new.user_id and archived_at is null;

  select (
    s.status in ('active', 'trialing')
    and (s.current_period_end is null or s.current_period_end > now())
  )
  into is_premium
  from public.subscriptions s
  where s.user_id = new.user_id;

  is_premium := coalesce(is_premium, false);
  limit_val := case when is_premium then 30 else 3 end;

  if active_count >= limit_val then
    raise exception 'Alcanzaste el límite de % hábitos activos', limit_val
    using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger habits_enforce_limit
before insert on public.habits
for each row execute function public.enforce_habit_limit();
