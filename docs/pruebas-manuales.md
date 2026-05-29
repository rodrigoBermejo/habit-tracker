# Plan de pruebas manuales — Habit Tracker

Output del agente `qa`. Una prueba manual observable por cada criterio de aceptación de `spec.md` (1–37), con trazabilidad 1-a-1. No existen tests automatizados (ver `AGENTS.md`): toda prueba la ejecuta una persona en el navegador, salvo la sección "Pruebas técnicas".

**Nota sobre simulación local (ADR-0004):**
- Criterios 24/29/30 se prueban contra la **pantalla de pago simulada** en `/cuenta` (Route Handler `api/checkout-sim`), no Stripe real.
- Criterios 31/32 se prueban ejecutando `/api/reminders/run` y observando su salida (JSON / tabla `reminder_log`), no contra email real.

---

## Auth

### PM-001 — Signup válido aterriza en onboarding
- **Criterio:** #1
- **Precondición:** Sin sesión. El email a usar no está registrado.
- **Pasos:** 1) Ir a `/signup`. 2) Escribir email nuevo + contraseña válida. 3) Enviar.
- **Resultado esperado:** Redirige a `/onboarding`; header en estado autenticado ("Cerrar sesión" visible). Sin error.

### PM-002 — Signup con email ya registrado se rechaza
- **Criterio:** #2
- **Precondición:** Existe cuenta con `existente@test.com`. Sin sesión.
- **Pasos:** 1) Ir a `/signup`. 2) Escribir `existente@test.com` + contraseña. 3) Enviar.
- **Resultado esperado:** Mensaje exacto "Ese email ya tiene cuenta". Permanece en `/signup`; no se duplica la cuenta.

### PM-003 — Login válido aterriza en la pantalla del día
- **Criterio:** #3
- **Precondición:** Cuenta con credenciales válidas conocidas. Sin sesión.
- **Pasos:** 1) Ir a `/login`. 2) Email y contraseña correctos. 3) Enviar.
- **Resultado esperado:** Redirige a `/`; se muestra la lista de hábitos del usuario.

### PM-004 — Recuperación de contraseña por email
- **Criterio:** #4
- **Precondición:** Cuenta existente con email accesible. Sin sesión.
- **Pasos:** 1) En `/login` clickear "¿Olvidaste tu contraseña?". 2) Ingresar email y enviar. 3) Abrir email y clickear link. 4) En `/reset` definir contraseña nueva. 5) Login con la nueva.
- **Resultado esperado:** Llega email con link; el link abre `/reset`; tras guardar, el login con la nueva contraseña tiene éxito y aterriza en `/`.

### PM-005 — Logout redirige a login
- **Criterio:** #5
- **Precondición:** Usuario autenticado en cualquier ruta.
- **Pasos:** 1) Clickear "Cerrar sesión" en el header.
- **Resultado esperado:** Sesión cerrada y redirige a `/login`. Volver a `/` manualmente re-redirige a `/login`.

### PM-006 — Sesión expirada redirige con toast
- **Criterio:** #6
- **Precondición:** Usuario en `/` con sesión invalidada/expirada.
- **Pasos:** 1) Con la sesión expirada, intentar una acción autenticada (toggle).
- **Resultado esperado:** Redirige a `/login` y aparece toast exacto "Tu sesión expiró, ingresa de nuevo".

---

## Onboarding

### PM-007 — Onboarding muestra CTA "Crear tu primer hábito"
- **Criterio:** #7
- **Precondición:** Usuario recién creado, en `/onboarding`.
- **Pasos:** 1) Observar la pantalla. 2) Clickear el CTA.
- **Resultado esperado:** Una sola pantalla con texto introductorio y único CTA "Crear tu primer hábito". Al clickearlo abre el formulario de creación.

### PM-008 — Usuario existente al login aterriza en `/`
- **Criterio:** #8
- **Precondición:** Cuenta con signup completado en sesión previa. Sin sesión.
- **Pasos:** 1) Login con esa cuenta.
- **Resultado esperado:** Aterriza directamente en `/`, no en `/onboarding`.

---

## Hábitos

### PM-009 — Free crea hábito y aparece sin recargar
- **Criterio:** #9
- **Precondición:** Free con 0–2 hábitos activos. Sesión en `/`.
- **Pasos:** 1) Abrir form. 2) Nombre "Leer", frecuencia "diaria". 3) Guardar.
- **Resultado esperado:** "Leer" aparece en `/` inmediatamente, sin recargar, con su toggle.

### PM-010 — Free bloqueado al crear el 4º hábito
- **Criterio:** #10
- **Precondición:** Free con exactamente 3 activos.
- **Pasos:** 1) Intentar crear un cuarto.
- **Resultado esperado:** Modal exacto "Alcanzaste el límite de 3 hábitos. Sube a Premium para crear más" con CTA a `/cuenta`. No se crea.

### PM-011 — Premium crea hábito por debajo del límite
- **Criterio:** #11
- **Precondición:** Premium con 0–29 activos.
- **Pasos:** 1) Crear uno más válido. 2) Guardar.
- **Resultado esperado:** Se crea y aparece en `/`. Sin modal de límite.

### PM-012 — Premium bloqueado al crear el hábito 31
- **Criterio:** #12
- **Precondición:** Premium con exactamente 30 activos.
- **Pasos:** 1) Intentar crear otro.
- **Resultado esperado:** Mensaje exacto "Alcanzaste el límite de 30 hábitos activos"; no se crea (sigue en 30).

### PM-013 — Edición se persiste tras recargar
- **Criterio:** #13
- **Precondición:** Usuario con un hábito existente.
- **Pasos:** 1) Editar nombre, descripción, frecuencia a "semanal", target 1–7. 2) Guardar. 3) Recargar.
- **Resultado esperado:** Tras recargar, el hábito muestra los nuevos valores.

### PM-014 — Nombre duplicado entre activos se rechaza
- **Criterio:** #14
- **Precondición:** Usuario con hábito activo "Correr".
- **Pasos:** 1) Crear o renombrar otro con "Correr". 2) Enviar.
- **Resultado esperado:** Mensaje exacto "Ya tienes un hábito activo con ese nombre"; operación rechazada.

### PM-015 — Archivar saca de `/` y deja en `/archivados`
- **Criterio:** #15
- **Precondición:** Usuario con hábito activo "Meditar".
- **Pasos:** 1) Archivar "Meditar". 2) Volver a `/`. 3) Ir a `/archivados`.
- **Resultado esperado:** En `/` ya no aparece; en `/archivados` sí aparece.

### PM-016 — Desarchivar devuelve a `/` y acepta toggles
- **Criterio:** #16
- **Precondición:** "Meditar" archivado en `/archivados`.
- **Pasos:** 1) "Desarchivar". 2) Volver a `/`. 3) Toggle a "hecho".
- **Resultado esperado:** Reaparece en `/` y el toggle persiste (no se rechaza).

### PM-017 — Toggle de hábito archivado se rechaza con 400
- **Criterio:** #17
- **Precondición:** Hábito archivado de id conocido.
- **Pasos:** 1) Forzar toggle vía URL directa / endpoint (consola de red).
- **Resultado esperado:** Rechazo HTTP 400 con mensaje "Hábito archivado". El check-in no cambia.

---

## Registro diario y racha

### PM-018 — Toggle "hecho" persiste tras recargar y entre dispositivos
- **Criterio:** #18
- **Precondición:** Hábito activo en `/`. Segundo dispositivo con la misma cuenta.
- **Pasos:** 1) Toggle a "hecho". 2) Recargar y observar ≤5s. 3) Login en segundo dispositivo y abrir `/`.
- **Resultado esperado:** Tras recargar (≤5s) sigue "hecho"; en el segundo dispositivo aparece "hecho" del día.

### PM-019 — Hábito nuevo sin check-in: racha 0 "Empieza hoy"
- **Criterio:** #19
- **Precondición:** Hábito diario recién creado, sin check-in.
- **Pasos:** 1) Abrir `/habito/[id]` (o ver racha en `/`).
- **Resultado esperado:** Racha exactamente "0" con etiqueta exacta "Empieza hoy".

### PM-020 — Racha diaria = N consecutivos; un hueco la rompe a 0
- **Criterio:** #20
- **Precondición:** Hábito diario con "hecho" en los últimos N días consecutivos terminando hoy.
- **Pasos:** 1) Leer racha en `/habito/[id]`. 2) Asegurar un día sin "hecho" entre hoy y el último y releer.
- **Resultado esperado:** Con N consecutivos terminando hoy, racha = "N". Con un hueco, racha = "0".

### PM-021 — Racha semanal = semanas consecutivas con ≥T
- **Criterio:** #21
- **Precondición:** Hábito semanal `target=T`; últimas S semanas con ≥T, la previa con <T.
- **Pasos:** 1) Leer racha en `/habito/[id]`.
- **Resultado esperado:** Racha = "S". La semana con <T corta la racha.

### PM-022 — Franja de 14 celdas con colores verde/rojo/gris
- **Criterio:** #22
- **Precondición:** Hábito con historial mixto y `created_at` dentro de los últimos 14 días.
- **Pasos:** 1) Abrir `/habito/[id]`. 2) Observar la franja.
- **Resultado esperado:** 14 celdas incluyendo hoy; hecho = verde, no-hecho = rojo, anterior a `created_at` = gris vacío.

### PM-023 — Modal de celebración al cruzar racha 7 (y 30) por primera vez
- **Criterio:** #23
- **Precondición:** Hábito diario con 6 consecutivos terminando ayer, sin check-in de hoy, sin haber cruzado 7 antes.
- **Pasos:** 1) Toggle a "hecho" hoy (día 7). 2) Observar. 3) Descartar el modal.
- **Resultado esperado:** Modal descartable "¡Racha de 7!"; al descartar desaparece. Análogo para "¡Racha de 30!".

---

## Estadísticas y plan

### PM-024 — Free ve paywall en `/estadisticas`
- **Criterio:** #24
- **Precondición:** Free (suscripción simulada inactiva).
- **Pasos:** 1) Ir a `/estadisticas`.
- **Resultado esperado:** Pantalla "Estadísticas es premium" con CTA a `/cuenta`. Sin estadísticas.

### PM-025 — Premium ve estadísticas de activos y archivados
- **Criterio:** #25
- **Precondición:** Premium con ≥1 activo y ≥1 archivado.
- **Pasos:** 1) Ir a `/estadisticas`.
- **Resultado esperado:** Por cada hábito activo y archivado: nombre, % cumplimiento 30 días, mejor racha.

### PM-026 — % diario sobre días activos en ventana
- **Criterio:** #26
- **Precondición:** Premium con hábito diario creado hace 10 días, no archivado, 7 días "hecho" en ventana.
- **Pasos:** 1) Leer el % en `/estadisticas`.
- **Resultado esperado:** % = hechos / días_activos, ventana `MAX(created_at, hoy−29)`..`MIN(archived_at−1, hoy)`. Caso: 7/10 = "70%".

### PM-027 — % semanal sobre semanas activas en ventana
- **Criterio:** #27
- **Precondición:** Premium con hábito semanal `target=T`, 4 semanas activas en ventana, 3 con ≥T.
- **Pasos:** 1) Leer el % en `/estadisticas`.
- **Resultado esperado:** % = semanas_con_≥T / semanas_activas, acotado por `created_at`/`archived_at`. Caso: 3/4 = "75%".

### PM-028 — Archivado etiquetado y % sobre período activo
- **Criterio:** #28
- **Precondición:** Premium con hábito archivado dentro de la ventana de 30 días.
- **Pasos:** 1) Localizarlo en `/estadisticas`.
- **Resultado esperado:** Etiqueta exacta "Archivado" junto al nombre; % calculado solo sobre el período activo (denominador no incluye días posteriores a `archived_at`).

### PM-029 — Activar Premium (pago simulado) refleja plan = Premium
- **Criterio:** #29
- **Precondición:** Free en `/cuenta`. (Pago simulado, ADR-0004.)
- **Pasos:** 1) "Activar Premium". 2) Completar pantalla de pago simulada. 3) Esperar redirect a `/cuenta`.
- **Resultado esperado:** Tras el redirect, `/cuenta` muestra plan "Premium" en ≤10s. "Activar Premium" se reemplaza por gestión Premium.

### PM-030 — Cancelar: "Premium hasta DD/MM/YYYY" y excedente read-only al expirar
- **Criterio:** #30
- **Precondición:** Premium con >3 activos. (Pago simulado.)
- **Pasos:** 1) "Cancelar" y confirmar. 2) Observar plan. 3) Tras fin de período (simulado), intentar toggle en hábito que excede 3.
- **Resultado esperado:** Al cancelar muestra "Premium hasta DD/MM/YYYY". Al expirar pasa a Free; los hábitos que exceden 3 quedan read-only (toggle deshabilitado) hasta archivar/reducir a 3 o reactivar.

---

## Recordatorios

### PM-031 — Recordatorio se "envía" si no está hecho; no si ya está hecho
- **Criterio:** #31
- **Precondición:** Hábito "Beber agua" con `reminder_hour=08:00`, hora local ≥ 08:00. (Recordatorios simulados.)
- **Pasos:** 1) Sin check-in de hoy, ejecutar `/api/reminders/run` y leer salida. 2) Marcar "hecho" y re-ejecutar; leer salida.
- **Resultado esperado:** Paso 1: salida incluye recordatorio para "Beber agua" con asunto "Recordatorio: Beber agua" y link a la app. Paso 2: salida NO incluye recordatorio para "Beber agua".

### PM-032 — Hábito sin hora nunca genera recordatorio
- **Criterio:** #32
- **Precondición:** Hábito "Estirar" sin `reminder_hour`, sin check-in de hoy.
- **Pasos:** 1) Ejecutar `/api/reminders/run` y leer salida.
- **Resultado esperado:** La salida NO contiene recordatorio para "Estirar", a cualquier hora.

---

## Aislamiento entre usuarios (UI)

### PM-033 — A solo ve sus hábitos; id de B da 404
- **Criterio:** #33
- **Precondición:** Usuarios A y B con hábitos; id de hábito de B conocido. Sesión como A.
- **Pasos:** 1) Abrir `/`, `/estadisticas`, `/archivados`. 2) Abrir un `/habito/[id]` de A. 3) Abrir `/habito/[id]` con id de B.
- **Resultado esperado:** A solo ve hábitos de A en las listas; `/habito/[id]` de A se muestra; con id de B → página 404.

---

## Compartir y PWA

### PM-034 — Compartir racha invoca Web Share API
- **Criterio:** #34
- **Precondición:** `/habito/[id]` con racha N≥1, navegador con Web Share API.
- **Pasos:** 1) Clickear "Compartir racha".
- **Resultado esperado:** Diálogo nativo con texto exacto "Llevo N días con [nombre]". En navegador sin soporte, el botón no aparece.

### PM-035 — `/` offline: último estado read-only con banner
- **Criterio:** #35
- **Precondición:** Usuario que ya visitó `/` con sesión (SW registrado).
- **Pasos:** 1) Desactivar red. 2) Entrar a `/`.
- **Resultado esperado:** Lista de hábitos con último estado sincronizado, read-only (toggles no responden), banner exacto "Sin conexión".

### PM-036 — App instalable como PWA
- **Criterio:** #36
- **Precondición:** Navegador compatible. Primera visita.
- **Pasos:** 1) Entrar por primera vez. 2) Observar/activar el prompt nativo.
- **Resultado esperado:** El navegador ofrece instalar como PWA; al aceptar se instala como app independiente.

---

## Errores

### PM-037 — Fallo de red muestra toast no-bloqueante sin estado inconsistente
- **Criterio:** #37
- **Precondición:** `/` con hábito activo; se puede forzar fallo de red/servidor.
- **Pasos:** 1) Forzar el fallo. 2) Toggle/crear/editar de modo que la petición falle.
- **Resultado esperado:** Toast no-bloqueante exacto "No se pudo guardar, intenta de nuevo". La UI revierte/conserva estado coherente; el cambio no se muestra como guardado.

---

## Pruebas técnicas (fuera de QA manual)

Requieren acceso a base de datos o herramientas de desarrollo. Trazan con la sección homónima de `spec.md`.

### PT-001 — RLS de aislamiento (soporta #33)
Autenticarse como A vía cliente Supabase y ejecutar `select * from habits` y `select * from checkins`; debe devolver solo filas de A. Verificar con `service_role` que las policies existen y son `using (auth.uid() = user_id)`.

### PT-002 — Webhook de Stripe (camino real, no simulado; #29/#30)
**Nota:** hoy el pago está simulado (ADR-0004); no hay webhook. Aplica al conectar Stripe real. Simular `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated` con la CLI de Stripe y verificar `subscriptions`.

### PT-003 — Unicidad y constraints (soporta #14, #18)
Insertar dos checkins para `(habit_id, date)` y dos hábitos activos con el mismo `(user_id, name)`; ambos deben fallar por constraint.

### PT-004 — Job de recordatorios (cadencia y hora local; #31/#32)
**Nota:** hoy simulado vía `/api/reminders/run`. Al conectar el cron real (Supabase Scheduled Function), verificar cadencia y respeto de la hora local.

---

## Compuerta de cobertura

**Cobertura:** los 37 criterios (1–37) tienen exactamente una prueba (PM-001…PM-037), 1-a-1.

**Criterios huérfanos:** ninguno.

**Huecos / discrepancias spec ↔ ADR a mantener visibles (feedback loop spec → qa):**
- **#4 (reset):** el flujo UI es observable, pero la recepción real del email depende de un proveedor; bajo ADR-0004 no se envían emails reales. La entrega del email de reset no es comprobable sin buzón real configurado.
- **#29/#30 (Stripe):** redactados contra Stripe+webhook, simulados por ADR-0004. La parte real (webhooks, fallos de pago) queda en PT-002.
- **#31 (email):** la spec dice "recibe un email"; ADR-0004 lo simula a salida observable. No se verifica entrega ni contenido real.
- **#36 (instalación PWA):** depende de heurísticas del navegador; el prompt puede no dispararse de forma determinista. Observable pero no 100% reproducible.
