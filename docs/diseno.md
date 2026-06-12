# Sistema visual — Habit Tracker

> Documento de referencia (output del agente `disenador`). Define **un solo** sistema visual, decidido y cerrado. Un developer sin background de diseño debe poder maquetar cualquier pantalla de la spec sin tomar micro-decisiones de color, tamaño o espaciado.
>
> Restricciones que asume este sistema (de `AGENTS.md` y `spec.md`): app en español, mobile-first, PWA, tono calmado y motivador, sin gamificación agresiva. Estilos: **solo Tailwind CSS** (+ `shadcn/ui` permitido). Sin modo oscuro. Sin animaciones complejas. Sin librerías de UI pesadas.

---

## 0. Principios

1. **Calma sobre estímulo.** Fondos claros, un solo color de marca, mucho espacio en blanco. Nada de gradientes llamativos, confeti permanente ni colores saturados como base.
2. **Mobile-first.** Todo se diseña primero para ~360px de ancho. El layout máximo de contenido es una columna centrada de `max-width: 480px` (`max-w-[480px]`). En pantallas grandes la app sigue siendo una columna centrada, no un dashboard de varias columnas.
3. **Una acción primaria por pantalla.** El color de marca se reserva para la acción principal; todo lo demás es neutral.
4. **El verde/rojo solo significan estado de hábito**, no éxito/error genéricos de UI. Éxito/error de sistema usan sus propios semánticos.
5. **Sin gamificación agresiva.** La celebración de racha es un único modal sobrio y descartable, sin sonido ni animación intrusiva.

---

## 1. Tokens de diseño

Los tokens se declaran como **variables CSS** en `:root` (en `app/globals.css`) y se **mapean al theme de Tailwind** vía `@theme` (Tailwind v4) o `tailwind.config.ts` (`theme.extend`). Se incluyen ambas formas; el build usa una sola según la versión de Tailwind que genere `create-next-app`.

### 1.1 Paleta de color

#### Color de marca

Un solo color de marca: **teal/verde-azulado** — transmite calma y constancia sin ser el mismo verde de "hecho" (evita ambigüedad). Se usa para botones primarios, enlaces, foco y acentos.

| Token | HEX | Uso |
|---|---|---|
| `brand-50` | `#ECFDF8` | fondos sutiles, hover muy claro |
| `brand-100` | `#D0F7EC` | chips, badges suaves |
| `brand-200` | `#A6EEDB` | bordes de acento |
| `brand-300` | `#6FE0C6` | estados hover claros |
| `brand-400` | `#34CBA8` | iconografía de acento |
| `brand-500` | `#14A88A` | **color de marca base** |
| `brand-600` | `#0E8C72` | botón primario (default) |
| `brand-700` | `#0B6F5B` | botón primario (hover/active) |
| `brand-800` | `#0A5949` | texto sobre fondos brand claros |
| `brand-900` | `#08453A` | titulares de acento (raro) |

> Acción primaria: fondo `brand-600`, texto `#FFFFFF`, hover `brand-700`.

#### Neutrales (escala de grises)

| Token | HEX | Uso |
|---|---|---|
| `neutral-0` | `#FFFFFF` | superficie de cards y modales |
| `neutral-50` | `#F8FAF9` | **fondo de página (body)** |
| `neutral-100` | `#F1F4F3` | fondo de inputs, hover de filas |
| `neutral-200` | `#E3E8E6` | **bordes y divisores** |
| `neutral-300` | `#CBD2CF` | bordes de input en reposo, líneas finas |
| `neutral-400` | `#9AA3A0` | texto deshabilitado, placeholders |
| `neutral-500` | `#6B7572` | **texto secundario / labels** |
| `neutral-600` | `#4D5754` | texto de apoyo fuerte |
| `neutral-700` | `#374240` | íconos, texto en botones secundarios |
| `neutral-800` | `#222B29` | **texto principal de cuerpo** |
| `neutral-900` | `#141A19` | titulares |

#### Semánticos (estado de sistema)

Para toasts, validación de formularios, banners y avisos. **No** se usan para el estado de hábito.

| Token | HEX | Uso |
|---|---|---|
| `success-bg` | `#E7F6EE` | fondo de toast/banner de éxito |
| `success-fg` | `#1B7A47` | texto/borde de éxito |
| `error-bg` | `#FCEAEA` | fondo de toast/banner de error |
| `error-fg` | `#B42318` | texto/borde de error, mensajes de validación |
| `warning-bg` | `#FEF6E7` | fondo de aviso (límite de plan, offline) |
| `warning-fg` | `#8A5A00` | texto/borde de aviso |
| `info-bg` | `#EAF2FB` | fondo informativo (paywall suave) |
| `info-fg` | `#1F5FAE` | texto informativo |

#### Estados de hábito — franja de 14 días (cerrado por spec, criterio 22)

Estos tres colores son **exclusivos** de las celdas de la franja y del toggle de check-in.

| Token | HEX | Significado | Texto/borde encima |
|---|---|---|---|
| `cell-done` | `#2E9E5B` | **verde "hecho"** | texto `#FFFFFF`; borde `#268A4F` |
| `cell-missed` | `#D64545` | **rojo "no-hecho"** | texto `#FFFFFF`; borde `#BE3A3A` |
| `cell-empty` | `#E3E8E6` | **gris "vacío / anterior a `created_at`"** | sin texto; borde `#D5DBD9` |

> La celda de **hoy** lleva un anillo `brand-600` de 2px (`ring-2 ring-brand-600`) para distinguirse además del color.

#### Mapeo a Tailwind (v4, `@theme` en `globals.css`)

```css
:root {
  --color-brand-50:  #ECFDF8; --color-brand-100: #D0F7EC; --color-brand-200: #A6EEDB;
  --color-brand-300: #6FE0C6; --color-brand-400: #34CBA8; --color-brand-500: #14A88A;
  --color-brand-600: #0E8C72; --color-brand-700: #0B6F5B; --color-brand-800: #0A5949;
  --color-brand-900: #08453A;

  --color-neutral-0:   #FFFFFF; --color-neutral-50:  #F8FAF9; --color-neutral-100: #F1F4F3;
  --color-neutral-200: #E3E8E6; --color-neutral-300: #CBD2CF; --color-neutral-400: #9AA3A0;
  --color-neutral-500: #6B7572; --color-neutral-600: #4D5754; --color-neutral-700: #374240;
  --color-neutral-800: #222B29; --color-neutral-900: #141A19;

  --color-success-bg: #E7F6EE; --color-success-fg: #1B7A47;
  --color-error-bg:   #FCEAEA; --color-error-fg:   #B42318;
  --color-warning-bg: #FEF6E7; --color-warning-fg: #8A5A00;
  --color-info-bg:    #EAF2FB; --color-info-fg:    #1F5FAE;

  --color-cell-done:   #2E9E5B; --color-cell-missed: #D64545; --color-cell-empty:  #E3E8E6;
}
```

> Resultado: clases como `bg-brand-600`, `text-neutral-800`, `border-neutral-200`, `bg-cell-done`, `text-error-fg`. En Tailwind v3 declarar lo mismo en `theme.extend.colors`.

### 1.2 Tipografía

**Familia: system font stack** (sin dependencias, sin web fonts — coherente con PWA ligera).

```css
--font-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, "Noto Sans", sans-serif;
--font-mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
```

#### Escala (base 16px = 1rem)

| Token | rem / px | line-height | Uso |
|---|---|---|---|
| `text-xs` | 0.75rem / 12px | 16px | metadatos, etiquetas de celda |
| `text-sm` | 0.875rem / 14px | 20px | texto secundario, labels |
| `text-base` | 1rem / 16px | 24px | **cuerpo por defecto, inputs** |
| `text-lg` | 1.125rem / 18px | 28px | nombre de hábito en card |
| `text-xl` | 1.25rem / 20px | 28px | título de sección |
| `text-2xl` | 1.5rem / 24px | 32px | título de pantalla |
| `text-3xl` | 1.875rem / 30px | 36px | cifra de racha, hero de onboarding |

> Inputs siempre en `text-base` (16px) para evitar el zoom automático de iOS.

#### Pesos

`font-normal` 400 (cuerpo) · `font-medium` 500 (labels, nombre de hábito, botones) · `font-semibold` 600 (títulos) · `font-bold` 700 (solo cifra de racha grande). No se usan 800/900.

### 1.3 Espaciado, radios, sombras, foco

**Escala base de 4px** (la nativa de Tailwind: `1` = 4px).

- Padding horizontal de página: `px-4` (16px) en mobile, contenido en `max-w-[480px] mx-auto`.
- Touch target mínimo: 44–48px → botones y toggles usan `min-h-12` (48px).
- Gap de la franja de 14 celdas: `gap-1` (4px). Separación entre cards: `space-y-5`.

**Radios:** `rounded-sm` 4px (celdas, chips) · `rounded-md` 8px (inputs, botones) · `rounded-lg` 12px (cards) · `rounded-xl` 16px (modales) · `rounded-full` (toggle, badge).

**Sombras (suaves):** `shadow-card` `0 1px 2px rgba(20,26,25,.06), 0 1px 3px rgba(20,26,25,.04)` · `shadow-pop` `0 4px 12px rgba(20,26,25,.10)` · `shadow-modal` `0 12px 32px rgba(20,26,25,.18)`. Las cards pueden usar solo `border border-neutral-200`.

**Foco visible (obligatorio, barato pese a no exigir WCAG AA):**
```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600
focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50
```
Todo elemento interactivo lo aplica.

---

## 2. Inventario de componentes

Estados estándar por componente: **default**, **activo** (hover/pressed/loading), **deshabilitado/read-only**, **error**.

Convención de botones:
- **Primario:** `bg-brand-600 text-white font-medium rounded-md min-h-12 px-4`; hover `bg-brand-700`; disabled `bg-neutral-200 text-neutral-400 cursor-not-allowed`; loading = spinner + texto.
- **Secundario:** `bg-white text-neutral-800 border border-neutral-300 rounded-md min-h-12 px-4`; hover `bg-neutral-100`.
- **Fantasma/texto:** `text-brand-700 font-medium`; hover `underline`.
- **Destructivo:** texto `text-error-fg` o secundario con borde `error-fg`. Nunca fondo rojo sólido salvo confirmación final.

### 2.1 Header (`components/Header.tsx`)
Barra superior en rutas autenticadas: wordmark "Hábitos" (`brand-700`, `font-semibold`) + menú ("Estadísticas", "Archivados", "Cuenta", "Cerrar sesión" — criterio 5). Altura 56px, `bg-white border-b border-neutral-200`, contenido en `max-w-[480px] mx-auto px-4`. Ítem de la ruta actual en `text-brand-700 font-medium`. Siempre operable.

### 2.2 Card de hábito (`components/HabitCard.tsx`)
Unidad de la lista en `/`: nombre (`text-lg font-medium`), badge de frecuencia ("Diario" / "Semanal · 3/sem"), racha ("Racha: N días" o "Empieza hoy" — criterio 19), y el toggle a la derecha. Clickable hacia `/habito/[id]`. `bg-white border border-neutral-200 rounded-lg p-4 shadow-card`.
- **read-only:** (a) offline (criterio 35): toggle inerte `opacity-60 cursor-not-allowed`; (b) exceso de plan tras downgrade (criterio 30): badge "Read-only" en `warning-fg`, toggle bloqueado.
- **error:** si el toggle falla (criterio 37), la card revierte y se dispara toast; sin marca persistente.

### 2.3 Toggle de check-in (`components/CheckinToggle.tsx`)
Control binario más tocado (criterio 18). Círculo `rounded-full` 48×48.
- **no marcado:** `border-2 border-neutral-300 bg-white`, check `text-neutral-400`.
- **hecho:** `bg-cell-done border-cell-done`, check blanco; optimistic update con reversión si falla (criterio 37).
- **loading:** spinner dentro; no acepta segundo toque.
- **read-only:** `opacity-60 cursor-not-allowed` (offline, archivado criterio 17, exceso de plan criterio 30).

### 2.4 Franja de 14 celdas (`components/Streak14.tsx`)
Historial de 14 días incluyendo hoy en `/habito/[id]` (criterio 22). `flex gap-1`, celdas `rounded-sm flex-1 aspect-square`. Colores por dato: hecho `bg-cell-done`, no-hecho `bg-cell-missed`, vacío/anterior a `created_at` `bg-cell-empty`. La celda de hoy añade `ring-2 ring-brand-600 ring-offset-1`. Si no carga: 14 celdas grises + "No se pudo cargar el historial".

### 2.5 Formulario de hábito (`components/HabitForm.tsx`)
Crear/editar (criterios 9, 13, 14). Campos: nombre (1–60), descripción (textarea 0–280 con contador), frecuencia (segmented "Diaria"/"Semanal"), target_per_week (stepper 1–7, visible solo si semanal), hora de recordatorio (`time`, opcional, criterio 31). Inputs `bg-neutral-100 border border-neutral-300 rounded-md min-h-12 px-3 text-base`; labels `text-sm font-medium text-neutral-700`.
- **error:** mensaje bajo el campo `text-sm text-error-fg`, input `border-error-fg`. Casos: nombre vacío/>60, desc >280, duplicado (criterio 14 "Ya tienes un hábito activo con ese nombre"), target fuera de 1–7. Errores de red → toast.

### 2.6 Modal (`components/Modal.tsx`) — límite / celebración / paywall
Base: overlay `bg-neutral-900/40`, panel `bg-white rounded-xl shadow-modal p-6 max-w-[400px] mx-4`. Cierra con backdrop/Esc/botón.
- **límite (criterios 10, 12):** "Alcanzaste el límite de N hábitos…". Free → "Subir a Premium" → `/cuenta` + "Ahora no". Premium en 30 → solo "Entendido".
- **celebración (criterio 23):** "¡Racha de 7!" / "¡Racha de 30!", sobrio, acento `brand-600`, sin confeti ni sonido. Botón "Genial".

### 2.7 Toast (`components/Toast.tsx`)
Feedback no-bloqueante (criterios 6, 37). `fixed bottom-4 inset-x-4 max-w-[480px] mx-auto`, auto-descarte ~4s. Variantes: error ("No se pudo guardar, intenta de nuevo"), aviso ("Tu sesión expiró, ingresa de nuevo"), éxito, neutral.

### 2.8 Banner offline (`components/OfflineBanner.tsx`)
Tira bajo el header en offline (criterio 35): `bg-warning-bg text-warning-fg text-sm px-4 py-2`, texto "Sin conexión". Mientras está visible, los toggles quedan read-only.

### 2.9 Botón compartir (`components/ShareButton.tsx`)
"Compartir racha" en `/habito/[id]` vía Web Share API (criterio 34), texto "Llevo N días con [nombre]". **No se renderiza** si el navegador no soporta Web Share o si la racha es 0.

### 2.10 Paywall (`components/Paywall.tsx`)
Bloqueo de `/estadisticas` para Free (criterio 24): pantalla centrada, título "Estadísticas es premium", botón "Activar Premium" → `/cuenta`. Sin presión ni contadores. (El paywall por límite de hábitos es el Modal §2.6.)

### 2.11 Estado vacío (`components/EmptyState.tsx`)
"Aquí no hay nada todavía" motivador. `/` vacío → "Aún no tienes hábitos" + CTA; `/archivados` vacío → "No tienes hábitos archivados"; `/estadisticas` Premium vacío → CTA al form.

> Auxiliares (sin ficha propia, con tokens): **Badge de plan** (Free `bg-neutral-100 text-neutral-600`, Premium `bg-brand-100 text-brand-800`), **Badge "Archivado"** (criterio 28), **Stepper**, **Segmented control**, **Spinner** (`border-2 border-brand-600 border-t-transparent rounded-full animate-spin` — única animación permitida).

---

## 3. Estructura de páginas

### 3.1 Layouts
- **Autenticado** (`app/(app)/layout.tsx`): `<Header/>` + `<OfflineBanner/>` condicional + `<main class="max-w-[480px] mx-auto px-4 py-4 pb-16">`. Fondo `bg-neutral-50`. Toasts a nivel raíz. Rutas: `/`, `/estadisticas`, `/habito/[id]`, `/archivados`, `/cuenta`, `/onboarding`.
- **Auth** (`app/(auth)/layout.tsx`): sin nav; columna `max-w-[400px] mx-auto px-4`, centrada vertical, wordmark arriba. Rutas: `/login`, `/signup`, `/reset`.

### 3.2 Patrón por ruta

| Ruta | Patrón visual |
|---|---|
| **`/`** | Título con fecha de hoy. Lista de **HabitCard** (`space-y-5`) con **CheckinToggle**. Botón "+ Nuevo hábito" → **HabitForm**. **EmptyState** si vacío. **OfflineBanner** + read-only offline. Exceso read-only tras downgrade (criterio 30). |
| **`/login`** | "Inicia sesión". Email + contraseña, "Entrar", enlaces "¿Olvidaste tu contraseña?" → `/reset` y "Crear cuenta" → `/signup`. Error inline. |
| **`/signup`** | "Crea tu cuenta". Email + contraseña, "Crear cuenta". "Ese email ya tiene cuenta" inline (criterio 2). Éxito → `/onboarding`. |
| **`/reset`** | Dos modos: solicitar reset (email + "Enviar enlace") / definir nueva contraseña con token (criterio 4). |
| **`/onboarding`** | Una sola pantalla (criterio 7): hero "Empieza un hábito a la vez" + botón único "Crear tu primer hábito" → **HabitForm**. |
| **`/estadisticas`** | Free → **Paywall**. Premium → tarjetas por hábito activo y archivado (criterios 25–28): nombre + Badge "Archivado", "% (30 días)" `text-3xl font-bold` + barra (`bg-neutral-200` / relleno `bg-brand-500`), "Mejor racha: N días". |
| **`/habito/[id]`** | Nombre + frecuencia. Racha grande `text-3xl font-bold text-brand-700` o "Empieza hoy". **Streak14** con leyenda. **ShareButton** (si racha ≥1 y soporte). "Editar" + "Archivar" (con confirmación). 404 si id ajeno (criterio 33). |
| **`/archivados`** | Lista de archivados en cards atenuadas (`opacity-80`, sin toggle) + Badge "Archivado" + "Desarchivar" (criterio 16). EmptyState si no hay. |
| **`/cuenta`** | **Plan:** Badge vigente; Free → "Activar Premium" (criterio 29); Premium → "Cancelar suscripción" (→ "Premium hasta DD/MM/YYYY", criterio 30) y "Reactivar". **Sesión:** email + "Cerrar sesión". Spinner "Actualizando tu plan…" durante el redirect. |

### 3.3 404 / errores de ruta
Pantalla centrada: "No encontramos eso" + "Volver al inicio" → `/`. Usada para `/habito/[id]` ajeno (criterio 33). Sesión expirada NO muestra 404: redirige a `/login` + toast (criterio 6).

---

## 4. Checklist de arranque para el developer

1. Pega los tokens de §1.1 en `app/globals.css` y mapéalos a Tailwind.
2. Usa **solo** clases derivadas de tokens; nada de HEX sueltos en JSX.
3. Toda pantalla = un layout de §3.1 + el patrón de su ruta en §3.2.
4. Todo interactivo lleva el anillo de foco de §1.3 y `min-h-12`.
5. Verde/rojo/gris = exclusivos del estado de hábito (toggle + franja); sistema usa semánticos.
6. Una sola acción primaria (`brand-600`) por pantalla.
7. Animación permitida: solo el spinner de carga.
