"use client";

import { useOnline } from "@/lib/use-online";

/* Banner "Sin conexión" (criterio 35). Visible solo offline. */
export function OfflineBanner() {
  const online = useOnline();
  if (online) return null;
  return (
    <div className="bg-warning-bg text-warning-fg border-warning-fg/20 border-b px-4 py-2 text-center text-sm">
      Sin conexión
    </div>
  );
}
