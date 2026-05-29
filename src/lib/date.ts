/*
  Utilidades de fecha basadas en strings YYYY-MM-DD calculadas con la TZ del
  navegador (ADR-0001). Se trabaja con strings para evitar desfases de zona.
*/

/** Fecha local de hoy como YYYY-MM-DD. */
export function todayLocalISO(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Suma n días (puede ser negativo) a una fecha YYYY-MM-DD. */
export function addDaysISO(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + n);
  return todayLocalISO(date);
}

/** Días entre dos fechas YYYY-MM-DD (b - a), inclusivo si se suma 1 aparte. */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const da = Date.UTC(ay, am - 1, ad);
  const db = Date.UTC(by, bm - 1, bd);
  return Math.round((db - da) / 86_400_000);
}

/** Compara fechas YYYY-MM-DD: -1, 0, 1. */
export function compareISO(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Pasa un timestamptz (o Date) a YYYY-MM-DD local. */
export function toLocalISO(value: string | Date): string {
  return todayLocalISO(new Date(value));
}

/** Formatea una fecha YYYY-MM-DD a DD/MM/YYYY. */
export function formatDMY(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

/** Zona horaria IANA del navegador. */
export function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Mexico_City";
  } catch {
    return "America/Mexico_City";
  }
}
