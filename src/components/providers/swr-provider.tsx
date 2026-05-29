"use client";

import { SWRConfig } from "swr";
import type { ReactNode } from "react";

/*
  Configuración global de SWR (ADR-0003). Sin caching agresivo (spec, Ronda 2):
  revalida al enfocar y al reconectar para que la sincronía multi-dispositivo
  caiga en ≤5s (criterio 18).
*/
export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        dedupingInterval: 2000,
        shouldRetryOnError: false,
      }}
    >
      {children}
    </SWRConfig>
  );
}
