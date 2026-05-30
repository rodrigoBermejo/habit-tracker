import type { ReactNode } from "react";
import { Header } from "@/components/header";
import { OfflineBanner } from "@/components/offline-banner";
import { AuthGuard } from "@/components/auth-guard";

// Rutas autenticadas, client-side + SWR (ADR-0003): no tiene sentido prerender
// estático y rompe con el contexto de Auth. Se renderizan dinámicamente.
export const dynamic = "force-dynamic";

/* Layout autenticado (docs/diseno.md §3.1). */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <Header />
      <OfflineBanner />
      <main className="mx-auto max-w-[480px] px-4 py-4 pb-16">{children}</main>
    </AuthGuard>
  );
}
