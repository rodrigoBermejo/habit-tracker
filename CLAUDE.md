# Habit Tracker — instrucciones para el agente

Contexto completo del proyecto, en este orden:

- **`AGENTS.md`** — contrato del proyecto: stack cerrado, gitflow, prohibiciones (sin tests
  automatizados, etc.). Es la autoridad; léelo antes de trabajar.
- **`spec.md`** — especificación y los 37 criterios de aceptación.
- **`CONTEXT.md`** — bitácora de desviaciones y ediciones manuales. Toda desviación nueva se
  registra ahí.
- **`docs/`** — `adr/` (decisiones), `diseno.md` (sistema visual), `pruebas-manuales.md` (QA).
- **`.claude/`** — agentes (`implementer`, `reviewer`, `qa`, …) y skills del proyecto
  (`nuevo-adr`, `nueva-prueba-manual`).

## Reglas operativas

- **Workflows de n8n: siempre repo + instancia.** Todo workflow del proyecto debe existir en la
  instancia de n8n (donde corre) **y** versionado como export JSON en `n8n/*.json`. Cualquier
  cambio hecho en la instancia se re-exporta al repo en el mismo commit/PR. Procedimiento en
  `n8n/README.md`.
- **Gitflow:** rama por unidad de trabajo desde `develop`, commits atómicos con
  `npm run lint && npm run build` verdes, merge `--no-ff` a `develop`. Sincronizar `develop`
  (fetch + ff) antes de crear rama.
- **`src/lib/supabase/types.ts` no se edita a mano:** se regenera con el MCP de Supabase
  (`generate_typescript_types`).
