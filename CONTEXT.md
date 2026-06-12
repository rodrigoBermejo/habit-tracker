# CONTEXT.md — Bitácora de decisiones y ediciones manuales

Según `AGENTS.md`, aquí se documenta lo que se editó a mano o se desvía de lo generado,
con qué se cambió, por qué, y qué alternativa se descartó.

## Camino de construcción (resumen)

El proyecto se construyó dirigiendo agentes, en modo **híbrido**: se crearon los agentes del
currículo (`disenador`, `qa`, `reviewer`, `implementer`) y skills (`nuevo-adr`,
`nueva-prueba-manual`), y se usaron de inmediato para generar `docs/diseno.md` y
`docs/pruebas-manuales.md`, en vez de recorrer los pasos reflexivos del curso. Luego se
implementó la app por fases, una rama por unidad (gitflow), mergeando a `develop`.

## Servicios externos (decisión del usuario)

- **Supabase es real.** El proyecto `ncpdpkkbojwhrzprkxgw` tiene las 5 tablas migradas con RLS.
  Las migraciones de `supabase/migrations/` se aplicaron vía el **MCP de Supabase**
  (`apply_migration`). La anon key real vive en `.env.local` (no versionado).
- **Stripe y email se simulan en local** (ver `docs/adr/0004`). No hay cuentas de terceros.

## Desviaciones / ediciones manuales relevantes

1. **`src/lib/supabase/types.ts` se regenera por MCP, no a mano.** La versión inicial escrita a
   mano hacía que los writes de Supabase infirieran tipo `never` (el shape no incluía
   `__InternalSupabase` ni la forma exacta que espera `@supabase/supabase-js` 2.106). Se
   reemplazó por el output de `generate_typescript_types` del MCP. **No editar el bloque
   `Database` a mano**; regenerarlo. Los atajos (`Habit`, `Checkin`, …) están al final del archivo.

2. **`@supabase/ssr` se subió de 0.5.2 a 0.10.3.** La 0.5.2 referenciaba tipos de una versión
   vieja de `supabase-js` y rompía la inferencia de los writes. Alternativa descartada: castear
   cada insert/update a `any` (prohibido por contrato).

3. **`src/middleware.ts` tuvo marcadores de conflicto commiteados** por un re-merge fallido de la
   fase de auth; `develop` no compiló durante varias fases hasta el commit `fix/build-recovery`.
   Resuelto dejando la versión con `CookieOptions` tipado.

4. **Rutas `(app)` con `export const dynamic = "force-dynamic"`.** Son client-only con contexto
   de Auth; el prerender estático fallaba con "useAuth fuera de AuthProvider". No aportan valor
   estático. Alternativa descartada: envolver cada página en otro provider servidor.

5. **Endpoint de pago simulado `src/app/api/checkout-sim/route.ts` es SOLO-DEV.** Otorga Premium
   sin cobrar. **No debe desplegarse a producción tal cual** (ver ADR-0004). Igual el endpoint
   `src/app/api/reminders/run`.

6. **Recordatorios por TOAST + bitácora** (decisión del usuario). `ReminderToaster` dispara toasts
   al abrir la app; `api/reminders/run` registra en `reminder_log`. No se envían emails reales.

7. **Endurecimiento de seguridad** (`supabase/migrations/20260529000006`): se revocó `EXECUTE` de
   las funciones trigger `SECURITY DEFINER` tras detectarlo con el advisor del MCP.

8. **`src/app/globals.css` nunca recibió los tokens del sistema de diseño.** Quedó el default de
   create-next-app, por lo que Tailwind v4 no generaba las clases `bg-brand-*`, `bg-cell-*`,
   `text-error-fg`, `shadow-card`, etc. (~100 usos en componentes): botón primario sin fondo,
   franja de 14 días invisible. Se corrigió en `fix/design-tokens` agregando el bloque `@theme`
   de `docs/diseno.md` §1 (paletas, semánticos, celdas, sombras, system font stack) y el fondo
   `neutral-50` del body. Alternativa descartada: `tailwind.config` (en v4 el camino canónico
   es `@theme` en CSS).

9. **Chatbot de ayuda (extensión fuera de spec, ADR-0005).** Widget propio en
   `src/components/chat/` + workflow n8n `habit-tracker-faq` (id `xY29Fb9TUaD22pmn`) en
   `n8n.inadaptados.mx`, creado y administrado vía MCP. Su export está **versionado en
   `n8n/habit-tracker-faq.json`** (regla del usuario: todo workflow vive en repo + instancia;
   procedimiento de sync en `n8n/README.md`). URL del webhook en `NEXT_PUBLIC_CHAT_WEBHOOK_URL`.
   Las pruebas PM-038…PM-041 trazan con el ADR y no con criterios de `spec.md` (la skill
   `nueva-prueba-manual` exige criterio de spec; se desvía a propósito porque la feature es
   posterior a la spec).

## Pendiente para conectar servicios reales (post-build)

- Pegar `SUPABASE_SERVICE_ROLE_KEY` real en `.env.local` (hoy es placeholder) para que el pago
  simulado y los recordatorios escriban con service-role.
- Sustituir `checkout-sim` por Stripe Checkout + webhook, y `reminders/run` por un cron + email
  real (Resend), reutilizando `src/lib/reminders.ts`. Frontera aislada por la tabla
  `subscriptions` y la función pura.
