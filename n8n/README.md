# Workflows de n8n del proyecto

**Regla:** todo workflow de n8n del proyecto debe existir en **dos lugares a la vez**: la
instancia (donde corre) y este directorio (versionado en git). Cualquier cambio hecho en la
instancia se re-exporta aquí **en el mismo commit/PR** que lo motiva.

## Workflows

| Archivo | Instancia | Id | Webhook de producción |
|---|---|---|---|
| `habit-tracker-faq.json` | `n8n.inadaptados.mx` (proyecto personal de Rodrigo) | `xY29Fb9TUaD22pmn` | `POST https://n8n.inadaptados.mx/webhook/habit-tracker-faq` |

`habit-tracker-faq` es el chatbot de ayuda (FAQ) de la app — ver `docs/adr/0005`. Contrato:
`POST { message, sessionId }` → `200 { reply }`. CORS restringido al origen de la app.

## Cómo re-exportar (instancia → repo)

- **Vía MCP** (preferido): `get_workflow_details(workflowId)` y volcar `name`, `nodes`,
  `connections` y `settings` al JSON (sin `versionId`, `webhookId`, `scopes` ni metadatos de
  instancia). Conservar la referencia de credencial (`id` + `name`) — no incluye secretos.
- **Vía UI:** abrir el workflow → menú `⋯` → *Download* y limpiar los mismos campos de instancia.

## Cómo recrear (repo → instancia)

1. n8n → *Add workflow* → menú `⋯` → *Import from file* con el JSON.
2. Reasignar la credencial del nodo "OpenAI Chat Model" (la referencia viaja por nombre/id,
   el secreto vive solo en la instancia).
3. Ajustar `allowedOrigins` del nodo Webhook si cambia el dominio de la app.
4. Activar (publish). La URL de producción depende del `path` del Webhook, no del import.
