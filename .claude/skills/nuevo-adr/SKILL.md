---
name: nuevo-adr
description: Usar al crear un Architecture Decision Record nuevo en docs/adr/ del Habit Tracker. Garantiza numeración correlativa, formato estándar y calidad mínima (alternativas reales + al menos una consecuencia negativa). Rechaza ADRs incompletos.
---

# Skill: nuevo-adr

Estandariza la creación de ADRs en `docs/adr/`. Un agente piensa; este skill **garantiza** que
todos los ADRs tengan la misma calidad mínima sin volver a pensarla.

## Procedimiento

1. **Numeración:** lista `docs/adr/`, toma el número más alto y suma 1. Formato de archivo:
   `NNNN-titulo-en-kebab.md` (4 dígitos, p. ej. `0005-...`).
2. **Plantilla obligatoria:**

   ```markdown
   # ADR-NNNN — <título>

   - **Estado:** Aceptado | Propuesto | Reemplazado por ADR-XXXX
   - **Fecha:** YYYY-MM-DD
   - **Contexto previo:** <archivos/decisiones relevantes>

   ## Contexto
   <qué problema/decisión, qué dice la spec, por qué importa>

   ## Decisión
   <qué se decide, concreto y accionable>

   ## Consecuencias
   **Positivas:** <...>
   **Negativas (asumidas):** <al menos una, real>
   ```

## Compuertas de calidad (rechazar si falla alguna)

- **Es una decisión sobre el CÓMO, no sobre el qué/stack.** El stack está cerrado (AGENTS.md):
  un ADR que proponga reemplazar Next.js/Supabase/TypeScript se rechaza.
- **Tiene al menos una alternativa real considerada** (aunque la decisión final sea una sola):
  si no hubo alternativa, no se decidió nada.
- **Tiene al menos una consecuencia negativa asumida.** Un ADR sin costo explícito solo
  justifica lo cómodo: se rechaza.
- **No contradice la spec ni un ADR previo.** Si lo hace, repórtalo antes de escribir.

Si el ADR no pasa una compuerta, **no lo escribas**: reporta qué falta.
