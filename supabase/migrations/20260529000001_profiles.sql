-- ADR-0001: profiles 1:1 con auth.users. Guarda timezone (IANA) para la hora
-- local de los recordatorios y onboarded_at para el ruteo post-signup/login.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  timezone text not null default 'America/Mexico_City',
  onboarded_at timestamptz,
  created_at timestamptz not null default now()
);

-- Crea automáticamente el profile al registrarse un usuario.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
