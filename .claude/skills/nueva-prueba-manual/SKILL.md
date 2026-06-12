---
name: nueva-prueba-manual
description: Usar al añadir una prueba manual a docs/pruebas-manuales.md del Habit Tracker. Estandariza el formato y obliga a que cada prueba apunte a exactamente un criterio de aceptación de la spec, con resultado esperado observable. Rechaza pruebas vagas como "la app funciona bien".
---

# Skill: nueva-prueba-manual

Estandariza el formato de las pruebas manuales para que el reviewer pelee con la sustancia, no
con el formato. No hay tests automatizados en este proyecto (AGENTS.md): toda prueba es manual.

## Formato obligatorio de cada prueba

```markdown
### PM-NNN — <título corto>
- **Criterio:** #<N> (de spec.md) — exactamente uno
- **Precondición:** <estado necesario antes de empezar>
- **Pasos:**
  1. <acción observable>
  2. <acción observable>
- **Resultado esperado:** <observable y específico>
```

## Compuertas de calidad (rechazar si falla alguna)

- **Trazabilidad 1-a-1:** la prueba apunta a **exactamente un** criterio de aceptación de
  `spec.md` (cita su número). Una prueba que cubre "varias cosas" se divide.
- **Resultado observable:** el resultado esperado describe qué se ve/ocurre (texto exacto del
  toast, redirección, color de celda, estado del toggle...). **Se rechaza** "funciona bien",
  "se ve correcto" o cualquier resultado no observable.
- **Reproducible:** precondición y pasos bastan para que otra persona la ejecute igual.
- **Numeración correlativa:** `PM-NNN` continúa la secuencia existente en
  `docs/pruebas-manuales.md`.

Si la prueba no pasa una compuerta, **no la escribas**: reporta qué falta. Si el criterio es
inverificable tal como está redactado, repórtalo como hueco de spec (feedback loop spec → qa).
