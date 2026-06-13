# ADR-0006 — Pivote de nicho: Irreemplazable (reto de 28 días de IA)

- **Estado:** Aceptado
- **Fecha:** 2026-06-12
- **Contexto previo:** `spec.md` (producto genérico, base histórica), `docs/reto-irreemplazable-spec.md` (spec del pivote), ADR-0004 (frontera de pago), ADR-0005 (chatbot n8n)

## Contexto

El Habit Tracker genérico está completo y publicado, pero un tracker genérico compite contra
Habitica/Loop/Streaks sin diferenciador ni canal de adquisición. La investigación de mercado
mostró que los habit trackers **nichados** sostienen 2–3x el precio y retienen mejor, y que el
único nicho con **distribución propia desde el día 1** para este dueño es "práctica diaria de
IA" (audiencia del Instituto Inadaptados y del diplomado). Patrón validado: Coursiv (~$200k/mes)
con "reto de N días de IA", sin equivalente en español.

Hay que decidir CÓMO materializar el pivote sobre lo ya construido sin tirar el trabajo.

## Decisión

- **Evolucionar la misma app** (mismo repo y deploy) hacia el producto de nicho **Irreemplazable**,
  en vez de hacer un fork. La app se vuelve **reto-first**: el onboarding inscribe al reto de 28
  días; el tracker de hábitos libre sobrevive debajo como funcionalidad secundaria.
- **Reutilizar la mecánica existente:** la racha del reto usa la lógica pura de `src/lib/streak.ts`;
  el modelo del reto (tareas globales + completions por usuario) imita el patrón
  `habits`/`checkins` con RLS por dueño y un trigger de validación como `enforce_habit_limit`.
- **Contenido curado fijo:** UNA ruta de 28 tareas en `challenge_tasks` (seed), no generadas por
  IA — calidad controlada y es la expertise del dueño.
- **v1 gratis** para validar; el coach es el chatbot n8n existente con system prompt actualizado.
- **Alternativas descartadas:**
  - **Fork en dos productos** (genérico + reto): más limpio conceptualmente pero duplica repo,
    Supabase, deploy y mantenimiento desde el día 1 sin haber validado el nicho.
  - **Tracker-first con el reto como feature opcional:** menos rebranding, pero el onboarding por
    reto convierte mejor (patrón Coursiv) y "organiza tus hábitos" no comunica el nicho.
  - **Tareas generadas por IA vía n8n:** máximo wow, pero calidad impredecible e imposible de
    probar como base del producto en v1.
  - **Otros nichos** (fe, dejar de vapear): mejor o igual demanda, pero sin distribución propia.

## Consecuencias

**Positivas:** un solo producto que mantener; "con lo que ya tenemos" literal (datos, auth, RLS,
PWA, chatbot, sistema visual se reutilizan); el reto le da a la app un porqué y un canal; la
frontera de datos del reto queda aislada (3 tablas nuevas) sin tocar el tracker libre.

**Negativas (asumidas):**
- La `spec.md` original deja de describir el producto vivo: queda como base histórica y obliga a
  mantener dos specs (la vieja y `reto-irreemplazable-spec.md`).
- El tracker de hábitos libre queda como ciudadano de segunda: código que se mantiene pero deja de
  ser el foco; riesgo de que se pudra si el reto despega.
- El contenido de las 28 tareas es responsabilidad editorial del dueño: si el seed inicial (un
  borrador) no se revisa, el producto sale con contenido mediocre. La calidad del reto = la
  calidad de esas 28 tareas, no del código.
- v1 gratis no prueba disposición a pagar; la monetización real (Stripe) se difiere a v2.
