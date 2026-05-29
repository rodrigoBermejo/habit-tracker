import type { ReactNode } from "react";

/* Layout de auth (docs/diseno.md §3.1): columna centrada, sin nav. */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <p className="mb-6 text-center text-xl font-semibold text-brand-700">Hábitos</p>
        {children}
      </div>
    </main>
  );
}
