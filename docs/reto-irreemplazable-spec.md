# Spec — Irreemplazable (pivote de nicho)

> Evolución del Habit Tracker genérico (ver `spec.md`, base histórica) hacia un producto
> de nicho. La app, el repo y el deploy actuales **se convierten** en este producto; el
> tracker de hábitos libre sobrevive debajo. Decisión registrada en `docs/adr/0006`.

## Objetivo

**Irreemplazable** es un reto de 28 días para volverte irreemplazable usando IA todos los días.
Es **reto-first**: el usuario aterriza, se inscribe al reto, y cada día recibe UNA tarea concreta
de IA + su racha. El tracker libre de hábitos existe debajo como funcionalidad secundaria.

- **Posicionamiento:** "La IA no te va a reemplazar. Te va a reemplazar alguien que la usa todos
  los días." 28 días para volverte ese alguien.
- **Voz:** directa y retadora ("ponte perro", "no aflojes"), en español neutro-mexicano que
  viaja por LATAM. La voz vive en el copy y el coach, NO en el nombre.
- **Audiencia:** profesionales aprendiendo IA/automatización — audiencia del Instituto
  Inadaptados y del diplomado (canal de distribución propio).
- **Por qué este nicho:** único nicho con distribución propia desde el día 1; hueco sin
  competidor en español (Coursiv hace ~$200k/mes en inglés con el patrón "reto de N días de IA");
  el chatbot ya construido se vuelve coach del reto; la mecánica de rachas que ya tenemos es el
  corazón del producto.

## Scope v1 (esta entrega)

### Sí entra

- **El Reto de 28 días:** una ruta fija curada de 28 tareas diarias de IA (contenido en
  Supabase, seedeado). Cada tarea: título, consigna (qué hacer hoy) y un tip/recurso opcional.
- **Inscripción:** el usuario se inscribe una vez (un reto por usuario en v1). El onboarding
  post-signup es "Empieza el reto", no "crea tu primer hábito".
- **Avance secuencial y amable:** se desbloquea una tarea a la vez (la tarea del día = la
  siguiente no completada). Faltar un día **no rompe el reto**: lo pausa. La racha cuenta días
  consecutivos en que apareciste (reutiliza la lógica de `src/lib/streak.ts`).
- **Pantalla del día (`/`):** tarjeta grande con la tarea de hoy + botón "Hecho", racha del reto,
  barra de progreso (día N de 28). Debajo, acceso a "mis hábitos" (el tracker libre).
- **Progreso del reto (`/reto`):** franja/grid de 28 días (completado / actual / bloqueado),
  racha y mejor racha, celebración al terminar el reto (día 28).
- **Coach:** el chatbot (workflow n8n existente) se actualiza para conocer el reto y ayudar con
  dudas de cada tarea, con la voz "ponte perro". Sigue siendo FAQ + apoyo, sin acceso a datos.
- **Rebrand de superficie:** nombre "Irreemplazable" en header, manifest, títulos, onboarding y
  copy. Sistema visual de `docs/diseno.md` se mantiene (tokens brand/neutral).
- **Tracker libre intacto:** crear/editar/archivar hábitos, check-in, rachas, `/archivados`,
  `/estadisticas` (Premium), `/cuenta`, recordatorios, PWA — todo sigue funcionando.
- **v1 gratis:** el reto completo es gratis para validar activación, rachas y finalización. El
  pago simulado actual (`api/checkout-sim`) y el paywall de estadísticas quedan como están.

### No entra (v1)

- Stripe real / paywall sobre el reto (llega en v2 cuando sepamos qué retiene — ver ADR-0004
  para el camino de migración del pago).
- Múltiples rutas por perfil (v1 es UNA ruta curada).
- Tareas generadas por IA (v1 es contenido fijo y curado).
- Rediseño de landing/marketing site (v1 solo rebrand dentro de la app).
- Verificación de que el usuario "realmente hizo" la tarea (es honor system, igual que un
  check-in de hábito).
- Reiniciar/repetir el reto, o varios retos en paralelo.

## Modelo de datos

Tres tablas nuevas (migración + RLS siguiendo el patrón de `supabase/migrations/`):

- **`challenge_tasks`** (contenido global, seedeado, solo lectura para autenticados):
  `day_number` (1–28, PK), `title`, `prompt` (la consigna), `tip` (opcional).
- **`challenge_enrollments`** (una por usuario en v1): `user_id` (PK, ref auth.users),
  `started_on` (date local), `status` (`active` | `completed`), `created_at`. RLS por dueño.
- **`challenge_completions`** (una por día completado): `id`, `user_id`, `day_number`,
  `completed_on` (date local), `created_at`. Único `(user_id, day_number)`. RLS por dueño.

Derivados (no se almacenan): **día actual** = `count(completions) + 1` (tope 28); **tarea de
hoy** = `challenge_tasks` con ese `day_number`; **progreso** = `completions / 28`; **racha** =
días consecutivos con completion terminando hoy/ayer (lógica pura existente).

Regla de servidor (trigger, como `enforce_habit_limit`): solo se puede completar la tarea del
día actual (no saltar adelante), y solo si hay enrollment activo. La fecha se calcula en el
cliente con la TZ del navegador y se guarda como `DATE` (igual que checkins).

## Criterios de aceptación

1. Un usuario recién registrado aterriza en `/onboarding` y ve "Empieza el reto de 28 días"
   con un CTA que lo inscribe y lo lleva a `/`.
2. Un usuario inscrito en `/` ve la tarea del día actual (título + consigna), su racha del reto
   y la barra "Día N de 28".
3. Al marcar "Hecho" la tarea del día, se persiste, la barra avanza a N+1 y la racha se
   recalcula sin recargar; al recargar se mantiene.
4. Un usuario no puede completar una tarea futura ni repetir una ya hecha (rechazo en servidor
   con error claro); el cliente solo ofrece la tarea del día actual.
5. Faltar uno o más días no rompe el reto: al volver, la tarea del día actual sigue siendo la
   siguiente no completada; la racha de días consecutivos sí refleja el hueco (vuelve a contar
   desde el regreso).
6. En `/reto` el usuario ve un grid de 28 celdas: completadas, la actual destacada, las
   bloqueadas; más racha actual y mejor racha.
7. Al completar el día 28, aparece una celebración "¡Eres irreemplazable!" y el reto queda
   marcado como completado.
8. El usuario sigue pudiendo crear/editar/archivar hábitos libres y hacer check-in; el reto y
   los hábitos libres son independientes (completar el reto no toca los hábitos y viceversa).
9. El chatbot, al preguntarle por una tarea del reto o cómo funciona, responde con la
   información correcta y la voz del producto, sin inventar.
10. El nombre "Irreemplazable" aparece en el header, el título del navegador (manifest/metadata)
    y el onboarding; el sistema visual no se rompe.
11. Aislamiento: un usuario solo ve su propio enrollment y completions (RLS); el contenido de
    `challenge_tasks` es común a todos.

## No-goals

Heredados de `spec.md` (sin tests automatizados, sin OAuth, sin push, etc.) más: sin gamificación
agresiva fuera de la racha y la celebración final, sin ranking ni elementos sociales, sin
generación de contenido por IA en v1.

## Notas de migración a v2 (fuera de alcance)

- **Monetización:** días 1–7 gratis → desbloquear 8–28 + estadísticas con Stripe real
  (reutiliza la frontera de `subscriptions` y el camino de ADR-0004).
- **Más rutas** (n8n, contenido, IA para tu trabajo) y selección por perfil en onboarding.
- **Coach proactivo** (recordatorio diario de la tarea vía el canal de recordatorios).
