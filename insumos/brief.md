# Brief — Habit Tracker

## 1. El problema

Muchas personas quieren construir hábitos diarios (ejercicio, lectura, meditar,
estudiar) pero pierden continuidad porque no tienen un registro simple y a la
mano. Las apps existentes resuelven esto, pero o son demasiado pesadas
(gamificación agresiva, suscripciones, social), o son demasiado genéricas
(notas, hojas de cálculo) y no dan retroalimentación visual del progreso.

Falta una herramienta enfocada: registrar si hiciste tus hábitos hoy, ver tu
racha, y nada más. Sin fricción, sin onboarding largo, sin features que
distraigan del único trabajo importante: marcar hecho/no hecho cada día.

## 2. Núcleo obligatorio

1. **Autenticación de usuarios.** Cada persona tiene su cuenta y sus hábitos
   son privados. Login con email/contraseña vía Supabase Auth.
   *Decisiones abiertas:* ¿se permite OAuth (Google/GitHub) o solo email?
   ¿hay verificación por email obligatoria o login directo?

2. **Gestión de hábitos.** El usuario puede crear, editar, archivar y borrar
   hábitos. Cada hábito tiene al menos un nombre.
   *Decisiones abiertas:* ¿qué otros campos tiene un hábito (descripción,
   color, ícono, frecuencia objetivo)? ¿se pueden reordenar? ¿borrar es
   soft-delete o duro?

3. **Registro diario.** Para cada hábito, el usuario marca "hecho" o "no hecho"
   en un día específico. La vista principal muestra los hábitos activos del
   día actual con un toggle claro.
   *Decisiones abiertas:* ¿se puede marcar días pasados o solo el día actual?
   ¿qué zona horaria define "hoy"? ¿hay estado intermedio (saltado/parcial)?

4. **Visualización de progreso.** El usuario ve la racha actual de cada hábito
   y el historial reciente (últimos N días) de forma visual.
   *Decisiones abiertas:* ¿cómo se calcula la racha si un día no se registra
   nada (cuenta como fallado o como ignorado)? ¿qué ventana muestra el
   historial — 7, 14, 30 días?

5. **Persistencia y sincronía.** Los datos viven en Supabase Postgres y se
   sincronizan entre dispositivos del mismo usuario al iniciar sesión.

## 3. Extensiones (elegir máximo 1)

| Nombre | Descripción |
|---|---|
| Recordatorios | Notificaciones por email a una hora del día para hábitos pendientes. |
| Estadísticas | Vista con métricas agregadas: % de cumplimiento, mejor racha histórica, heatmap anual. |
| Hábitos compartidos | Permitir que dos usuarios sigan el mismo hábito y vean el progreso del otro. |
| Categorías y filtros | Agrupar hábitos por categoría (salud, trabajo, personal) y filtrar la vista. |
| Exportar datos | Descargar todo el historial del usuario en CSV o JSON. |
| Modo enfoque diario | Pantalla simplificada estilo "checklist de hoy" optimizada para móvil. |
| Notas por día | Para cada día y hábito, adjuntar una nota breve de contexto. |

## 4. Restricciones técnicas

- Next.js 15 con App Router.
- Supabase para Postgres y Auth (incluido Row Level Security).
- Deploy en Vercel.
- TypeScript con modo estricto.
- Tailwind CSS para estilos.

## 5. Lo que NO se evalúa

- Diseño visual premium: basta con que sea limpio, legible y consistente; no
  se evalúa identidad de marca, animaciones, ni microinteracciones pulidas.
- Performance avanzada: no hay metas de Core Web Vitals, ni optimización de
  bundles, ni SSR/ISR estratégico más allá de los defaults razonables.
- Tests automatizados: no se requiere cobertura unitaria, integración ni e2e.
- Responsive perfecto: debe ser usable en móvil, pero no se evalúan
  breakpoints intermedios ni gestos táctiles avanzados.
- Accesibilidad exhaustiva: contraste básico y semántica HTML mínima bastan;
  no se evalúa WCAG AA completo ni navegación por teclado avanzada.
