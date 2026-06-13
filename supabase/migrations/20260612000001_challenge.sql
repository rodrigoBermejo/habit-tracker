-- ADR-0006: Reto "Irreemplazable" de 28 días. Contenido curado global
-- (challenge_tasks), inscripción por usuario (challenge_enrollments) y
-- completados por día (challenge_completions). Avance secuencial: solo se
-- puede completar la tarea del día actual. Imita el patrón habits/checkins.

create type public.challenge_status as enum ('active', 'completed');

-- Contenido del reto: 28 tareas fijas, comunes a todos los usuarios.
create table public.challenge_tasks (
  day_number int primary key,
  title text not null,
  prompt text not null,
  tip text,
  constraint challenge_tasks_day_range check (day_number between 1 and 28),
  constraint challenge_tasks_title_len check (char_length(btrim(title)) between 1 and 80),
  constraint challenge_tasks_prompt_len check (char_length(btrim(prompt)) between 1 and 600)
);

-- Inscripción: una por usuario en v1.
create table public.challenge_enrollments (
  user_id uuid primary key references auth.users (id) on delete cascade,
  started_on date not null,
  status public.challenge_status not null default 'active',
  created_at timestamptz not null default now()
);

-- Días completados. La fecha la calcula el cliente con la TZ del navegador.
create table public.challenge_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  day_number int not null,
  completed_on date not null,
  created_at timestamptz not null default now(),
  constraint challenge_completions_day_range check (day_number between 1 and 28),
  constraint challenge_completions_unique unique (user_id, day_number)
);

create index challenge_completions_user on public.challenge_completions (user_id);

-- Avance secuencial y amable: solo la tarea del día actual, con reto activo.
-- El hueco por días faltados no rompe el reto (la tarea actual sigue siendo la
-- siguiente no completada); la racha de días consecutivos se calcula en cliente.
create or replace function public.enforce_challenge_progress()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  has_active boolean;
  done_count int;
begin
  select exists (
    select 1 from public.challenge_enrollments e
    where e.user_id = new.user_id and e.status = 'active'
  ) into has_active;

  if not has_active then
    raise exception 'No tienes un reto activo'
    using errcode = 'check_violation';
  end if;

  select count(*) into done_count
  from public.challenge_completions
  where user_id = new.user_id;

  if new.day_number <> done_count + 1 then
    raise exception 'Solo puedes completar la tarea del día actual'
    using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

create trigger challenge_enforce_progress
before insert on public.challenge_completions
for each row execute function public.enforce_challenge_progress();

-- Al completar el día 28, marca el reto como completado.
create or replace function public.mark_challenge_complete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  done_count int;
begin
  select count(*) into done_count
  from public.challenge_completions
  where user_id = new.user_id;

  if done_count >= 28 then
    update public.challenge_enrollments
    set status = 'completed'
    where user_id = new.user_id and status = 'active';
  end if;

  return null;
end;
$$;

create trigger challenge_mark_complete
after insert on public.challenge_completions
for each row execute function public.mark_challenge_complete();

-- RLS: el contenido es común; inscripción y completados son del dueño.
alter table public.challenge_tasks enable row level security;
alter table public.challenge_enrollments enable row level security;
alter table public.challenge_completions enable row level security;

create policy challenge_tasks_select on public.challenge_tasks
for select to authenticated using (true);

create policy challenge_enrollments_all on public.challenge_enrollments
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy challenge_completions_all on public.challenge_completions
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Endurecimiento (advisor de seguridad, ver CONTEXT.md): las funciones trigger
-- SECURITY DEFINER no deben ser ejecutables directamente por los roles cliente.
revoke execute on function public.enforce_challenge_progress() from public, anon, authenticated;
revoke execute on function public.mark_challenge_complete() from public, anon, authenticated;

-- Seed: 28 tareas (BORRADOR — el dueño las revisa/edita; ver ADR-0006).
insert into public.challenge_tasks (day_number, title, prompt, tip) values
(1,  'Tu primera conversación con propósito', 'Elige una tarea real que tengas hoy y pídele a una IA que te ayude a resolverla de principio a fin. No preguntas sueltas: una tarea completa.', 'Dale contexto: quién eres, qué necesitas y para qué. El contexto es el 80% de un buen resultado.'),
(2,  'El prompt que te ahorra una hora', 'Identifica algo repetitivo de tu trabajo y escribe un prompt reutilizable que lo resuelva. Guárdalo.', 'Un buen prompt tiene rol, objetivo, contexto y formato de salida.'),
(3,  'Resume lo que no tienes tiempo de leer', 'Toma un documento, correo largo o artículo y pídele a la IA un resumen con los 3 puntos que sí importan y qué acción tomar.', 'Pide el resumen en el formato que vas a usar: bullets, tabla o un párrafo.'),
(4,  'Escribe el correo difícil', 'Ese mensaje que llevas posponiendo: pídele a la IA un primer borrador, luego edítalo con tu voz.', 'La IA arranca, tú rematas. Nunca mandes el primer borrador sin leerlo.'),
(5,  'Convierte caos en estructura', 'Toma notas desordenadas (de una junta, una idea, un pendiente) y pídele que las organice en un plan claro.', 'Pídele que te haga preguntas si le falta información.'),
(6,  'La IA como sparring', 'Plantéale una decisión que tengas pendiente y pídele que defienda la postura contraria a la tuya.', 'Buscas huecos en tu razonamiento, no que te dé la razón.'),
(7,  'Tu primera semana, en números', 'Repasa la semana: ¿en qué te ayudó la IA? Pídele que te sugiera 3 usos nuevos para tu rol específico.', 'Sé concreto sobre tu rol y tu industria para que las ideas sirvan.'),
(8,  'Aprende algo en 20 minutos', 'Elige un tema que no dominas pero necesitas, y pídele a la IA que te lo explique como si tuvieras que usarlo mañana.', 'Pide ejemplos de tu contexto y que te haga un mini-quiz al final.'),
(9,  'Mejora algo que ya hiciste', 'Toma un trabajo tuyo (texto, propuesta, presentación) y pídele crítica honesta y específica para subirlo de nivel.', 'Pide que señale lo más débil primero, no que te elogie.'),
(10, 'Traduce entre mundos', 'Toma algo técnico de tu área y pídele que lo explique para alguien que no es del gremio (tu jefe, un cliente).', 'Comunicar claro lo complejo es una de las habilidades que más te vuelve irreemplazable.'),
(11, 'El analista de datos improvisado', 'Pega datos (ventas, métricas, una lista) y pídele que encuentre patrones y te diga qué deberías mirar.', 'Pregúntale qué dato te falta para concluir mejor.'),
(12, 'Genera 10 ideas, elige 1', 'Para un problema real de tu trabajo, pide 10 enfoques distintos. Luego pídele que critique los 3 mejores.', 'La cantidad primero, el juicio después. No filtres mientras generas.'),
(13, 'Tu asistente de reuniones', 'Antes de tu próxima junta, pídele que te prepare la agenda, las preguntas clave y los riesgos a anticipar.', 'Después de la junta, dale tus notas y pídele los acuerdos y siguientes pasos.'),
(14, 'Dos semanas: tu kit de prompts', 'Junta los mejores prompts que has usado y organízalos en un documento que puedas reusar. Ese es tu activo.', 'Nómbralos por tarea ("resumir junta", "redactar propuesta") para encontrarlos rápido.'),
(15, '¿Qué se puede automatizar?', 'Lista 3 procesos repetitivos de tu semana. Pídele a la IA cuál de ellos se podría automatizar y cómo.', 'Busca tareas con reglas claras y que hagas seguido: ahí está el oro.'),
(16, 'Conoce n8n', 'Investiga qué es n8n (o tu herramienta de automatización) y diseña en papel un flujo simple para una de las tareas del día 15.', 'Un flujo es: cuando pasa X (disparador), haz Y (acción). Empieza por uno solo.'),
(17, 'Tu primer flujo', 'Construye el flujo de automatización más simple que puedas que de verdad te sirva. Que funcione, aunque sea básico.', 'Si te trabas, pregúntale al coach del reto o a la IA paso a paso.'),
(18, 'Conecta dos herramientas', 'Haz que dos apps que usas hablen entre sí (ej. un formulario y una hoja de cálculo, o un chat y tu correo).', 'No tiene que ser perfecto. Tiene que quitarte un paso manual.'),
(19, 'La IA dentro de tu flujo', 'Mete un paso de IA en una automatización: que clasifique, resuma o redacte algo automáticamente.', 'Ej: que resuma cada correo nuevo, o etiquete mensajes por tema.'),
(20, 'Documenta tu sistema', 'Escribe cómo funciona lo que automatizaste, para que otro (o tu yo del futuro) lo entienda y lo mantenga.', 'Si solo tú lo entiendes, eres un cuello de botella, no irreemplazable.'),
(21, 'Tres semanas: enseña lo que sabes', 'Explícale a alguien (o graba un video corto) un truco de IA que aprendiste. Enseñar consolida.', 'Quien sabe usar IA y además sabe explicarla, vale doble.'),
(22, 'Resuelve un problema que no es tuyo', 'Pregúntale a un colega qué tarea lo trae frito y propón (o arma) una solución con IA o automatización.', 'Aquí dejas de practicar y empiezas a generar valor visible.'),
(23, 'Tu agente personal', 'Diseña un asistente de IA con instrucciones fijas para una tarea recurrente tuya (un GPT, un prompt-sistema, un flujo).', 'Dale una personalidad y reglas claras. Es tu empleado digital.'),
(24, 'Mide lo que ganaste', 'Calcula cuánto tiempo te ha ahorrado la IA en estas semanas. Ponle número. Ese número es tu caso.', 'Tiempo ahorrado x tu valor por hora = lo que vales más ahora.'),
(25, 'Audita tus puntos ciegos', 'Pídele a la IA que critique tu forma de trabajar y te diga dónde estás siendo reemplazable.', 'Pide honestidad brutal. El objetivo no es sentirte bien, es mejorar.'),
(26, 'Comparte tu sistema', 'Publica, presenta o comparte con tu equipo uno de los sistemas que construiste estas semanas.', 'Visible > perfecto. Que sepan que tú lo hiciste.'),
(27, 'Diseña tu próximo mes', 'Define 3 hábitos de IA que vas a sostener después del reto. Créalos como hábitos libres en la app.', 'El reto termina; la práctica no. Aquí enlazas con el tracker de hábitos.'),
(28, 'Eres irreemplazable', 'Escribe en una página qué cambió en cómo trabajas. Guárdala. Esa es la prueba de quién eres ahora.', 'Vuelve a leerla el día que dudes. Lo hiciste 28 días seguidos: ya no eres el mismo.');
