# ADR-0005 — Chatbot de ayuda (FAQ) con workflow n8n externo y widget propio

- **Estado:** Aceptado
- **Fecha:** 2026-06-12
- **Contexto previo:** decisión del usuario (extensión fuera de spec), `docs/diseno.md` (sistema visual), ADR-0004 (filosofía de simular/aislar servicios externos)

## Contexto

El usuario pidió agregar un chatbot de ayuda dentro de la app que responda preguntas sobre cómo
usarla (crear hábitos, rachas, planes Free/Premium, archivar, estadísticas, PWA). Es una
**extensión fuera de los 37 criterios de `spec.md`**. Restricciones acordadas: el bot es solo
FAQ (sin acceso a datos del usuario), la inteligencia vive en un workflow de **n8n**
(instancia `n8n.inadaptados.mx`, fuera de este repo) y la UI debe respetar el sistema de diseño
del proyecto.

## Decisión

- **Workflow n8n** `habit-tracker-faq` (id `xY29Fb9TUaD22pmn`, proyecto personal de Rodrigo):
  `Webhook POST` (CORS restringido al origen de la app) → `AI Agent` (OpenAI `gpt-5.4-mini`,
  Simple Memory con `sessionKey = body.sessionId`, system prompt con la base de conocimiento
  extraída de `spec.md`, respuesta en texto plano) → `Respond to Webhook` con `{ "reply": str }`.
- **Contrato:** el frontend manda `POST { message: string, sessionId: string }` a
  `NEXT_PUBLIC_CHAT_WEBHOOK_URL` y recibe `200 { reply: string }`. Cualquier otra cosa es error.
- **Widget propio** en React (`src/components/chat/`): botón flotante + panel, construido con
  los tokens y componentes UI existentes (`Button`, `Input`), montado en `(app)/layout.tsx`
  (solo rutas autenticadas). El `sessionId` es un `crypto.randomUUID()` persistido en
  `sessionStorage`; el historial visual vive solo en memoria de React.
- **Alternativas descartadas:**
  - **Widget `@n8n/chat` embebido:** integración en minutos, pero estilo ajeno al sistema de
    diseño, dependencia extra y menos control del manejo de errores/offline.
  - **Proxy Route Handler (`/api/chat`) con secreto server-side:** más seguro (oculta la URL
    del webhook), pero agrega una pieza server-side a una app client-first; se documenta como
    camino de migración, igual que en ADR-0004.
  - **Bot con acceso a datos del usuario (tool de Supabase en n8n):** más útil pero exige pasar
    identidad de forma segura al workflow; fuera del alcance pedido (solo FAQ).

## Cómo se endurecería (camino de migración)

Crear `src/app/api/chat/route.ts` que valide la sesión Supabase del usuario y reenvíe el mensaje
al webhook usando un secreto en header (`CHAT_WEBHOOK_SECRET`, sin `NEXT_PUBLIC_`), y activar
Header Auth en el nodo Webhook. El widget solo cambiaría la URL a `/api/chat`.

## Consecuencias

**Positivas:** ayuda contextual dentro de la app sin tocar el modelo de datos ni las rutas
existentes; la frontera es un único contrato HTTP (`{message, sessionId} → {reply}`), así que
el workflow puede evolucionar (otro modelo, RAG, tools) sin cambiar el frontend.

**Negativas (asumidas):**
- El webhook es **público** (solo protegido por CORS, que no aplica fuera del navegador):
  cualquiera con la URL puede gastar tokens del modelo. Aceptado por ser proyecto educativo;
  mitigación documentada arriba.
- La base de conocimiento está **duplicada** (spec.md ↔ system prompt del agente): si la app
  cambia, el prompt se desactualiza en silencio.
- El workflow corre en la instancia n8n y su export vive versionado en
  `n8n/habit-tracker-faq.json` (regla repo + instancia, ver `n8n/README.md`): el riesgo
  restante es la **deriva** si alguien edita la instancia sin re-exportar al repo.
- Las pruebas del chatbot (PM-038…PM-041) referencian este ADR y no un criterio de `spec.md`.
