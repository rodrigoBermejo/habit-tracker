# AGENTS.md — Contrato del proyecto Habit Tracker

Este documento es el contrato que todo agente (arquitecto, disenador, qa, reviewer,
implementer) y todo developer humano debe respetar. Lo que aqui esta definido esta
cerrado por contrato y no se renegocia en el build. Lo que no esta aqui es decision
abierta: tomala, pero documentala en el spec o en un ADR antes de implementar.

Regla raíz: una decisión no documentada es una decisión no tomada.

## Stack (cerrado)

- Frontend: Next.js 15 con App Router.
- Backend y datos: Supabase (Postgres + Auth + Storage).
- Lenguaje: TypeScript en modo estricto.
- Estilos: Tailwind CSS. Se permite shadcn/ui.
- Deploy: Vercel.

El stack es restriccion, no decision. Los ADRs deben tratar sobre como usar este
stack, nunca sobre si reemplazarlo.

## Convenciones de TypeScript

- `strict: true` siempre activo. No se desactivan flags de strictness.
- Prohibido `any` salvo justificacion explicita en CONTEXT.md. Preferir `unknown`,
  generics o tipos concretos.
- Tipar fronteras: props de componentes, retornos de funciones publicas, payloads de
  API y filas de Supabase (tipos generados o declarados).
- Nada de `@ts-ignore` ni `@ts-expect-error` sin comentario que explique el porque.
- Imports absolutos via alias del proyecto cuando exista (`@/...`).

## Estructura de carpetas esperada

```
app/                rutas y layouts (App Router)
components/         componentes de UI reutilizables
lib/               clientes, helpers y logica compartida
lib/supabase/      configuracion y tipos de Supabase
types/             tipos y contratos compartidos
docs/adr/          Architecture Decision Records
.claude/agents/    definiciones de agentes custom
.claude/skills/    skills del proyecto
```

Esta es la estructura esperada por defecto. Crear carpetas nuevas es decision abierta,
pero debe ser coherente con esta convencion.

## Politica de commits

- Commits atomicos: uno por unidad funcional. Prohibido el commit "implement everything".
- Cada commit deja el repo en estado verificable (compila, lintea).
- Mensajes en formato `tipo: descripcion en imperativo` (feat, docs, chore, fix).
- No se escribe codigo sin plan aprobado. El plan precede al commit.

## Flujo git (gitflow, cerrado)

- `main`: rama estable. Solo recibe merges desde `develop`.
- `develop`: rama de integracion. Recibe el trabajo terminado.
- Ramas tipadas por unidad de trabajo, creadas desde `develop`:
  - `feat/...`  nueva funcionalidad
  - `docs/...`  documentacion
  - `chore/...` mantenimiento, configuracion, andamiaje
  - `fix/...`   correccion de errores
- Cada rama de trabajo se mergea a `develop` al terminar su unidad.
- Nada se queda sin commitear. No hay trabajo huerfano fuera de una rama.

## Regla de CONTEXT.md

Toda edición manual de código que no haya sido generada por un agente se documenta en
CONTEXT.md con: qué se cambió, por qué, y qué alternativa generada por agente se
descartó. La honestidad en CONTEXT.md es parte de la evaluación: si lo editaste a
mano y no lo anotaste, cuenta como no documentado.

## Prohibiciones explicitas (cerradas)

- Prohibido `any` sin justificacion en CONTEXT.md.
- Prohibidas librerias de componentes pesadas: no Material UI, no Chakra UI ni
  equivalentes. Tailwind (y shadcn/ui si se requiere) cubren la UI.
- Prohibido introducir tests automatizados: estan fuera del alcance de este proyecto.
- Prohibido escribir codigo sin plan aprobado.
- Prohibido cambiar el stack o el flujo git definidos arriba.
- Prohibido commitear trabajo no verificable o no atomico.

## Decisiones abiertas vs cerradas

- Cerrado: stack, flujo git, prohibiciones, politica de commits, regla de CONTEXT.md.
- Abierto (decidir y documentar en spec o ADR): modelado de datos, reglas de negocio
  del producto (check-in, racha, edicion/borrado de habitos), nombres internos,
  organizacion fina de carpetas y eleccion de la unica extension permitida.
