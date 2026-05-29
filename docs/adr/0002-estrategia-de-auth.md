# ADR-0002 — Estrategia de autenticación

- **Estado:** Aceptado
- **Fecha:** 2026-05-29
- **Contexto previo:** `spec.md` (Auth, Ronda 3), `AGENTS.md` (stack cerrado)

## Contexto

La spec pide signup/login/logout/reset por email+contraseña vía Supabase Auth, sin OAuth y
sin verificación de email obligatoria. La arquitectura es Client Components + cliente Supabase
+ SWR (ADR-0003), no Server Components ni middleware de datos. Hay que decidir **cómo** se
protege la navegación y cómo se distingue al usuario recién registrado.

## Decisión

- **Proveedor:** Supabase Auth, email + contraseña. Sin OAuth, sin verificación obligatoria
  (no-goals de la spec). Reset vía `supabase.auth.resetPasswordForEmail` + página `/reset`.
- **Sesión:** la maneja el cliente Supabase (persistencia en localStorage, auto-refresh). Un
  `AuthProvider` (Client Component) se suscribe a `onAuthStateChange` y expone `{ session, user }`
  por contexto; en `SIGNED_OUT` redirige a `/login`.
- **Protección de rutas:** guard **client-side** (componente que redirige a `/login` si no hay
  sesión) **+** un `middleware.ts` ligero **solo para redirección** (evita el flash de contenido
  protegido). El middleware no lee datos ni hace lógica de negocio, compatible con la regla
  "no RSC/Server Actions para datos".
- **Sesión expirada (criterio 6):** los errores de auth de Supabase (401 / `PGRST301` /
  `AuthApiError`) se detectan en un helper común, que fuerza `signOut()` → redirect a `/login`
  con toast "Tu sesión expiró, ingresa de nuevo".
- **Onboarding (criterios 7–8):** señal explícita `profiles.onboarded_at`. Post-signup →
  `/onboarding`; tras completar onboarding se setea `onboarded_at`; logins posteriores → `/`.

## Consecuencias

**Positivas:** mínimo código de servidor; la sesión vive donde viven los datos (cliente);
el middleware de redirección mejora UX sin romper la arquitectura.

**Negativas (asumidas):**
- Sin verificación de email, cualquiera puede registrarse con un email que no controla (riesgo
  aceptado por la spec; el reset password sigue requiriendo acceso al buzón).
- La sesión en localStorage es **vulnerable a XSS**: si se cuela script malicioso, el token es
  accesible. Se mitiga con el modelo por defecto de Supabase y disciplina de no inyectar HTML.
- El guard client-side implica que, sin el middleware, habría un parpadeo de contenido
  protegido; dependemos del middleware para evitarlo (una pieza más que mantener).
