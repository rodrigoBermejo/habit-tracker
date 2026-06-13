"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { InstallButton } from "@/components/install-button";

const NAV = [
  { href: "/", label: "Hoy" },
  { href: "/reto", label: "Reto" },
  { href: "/estadisticas", label: "Estadísticas" },
  { href: "/archivados", label: "Archivados" },
  { href: "/cuenta", label: "Cuenta" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-[480px] flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="text-lg font-semibold text-brand-700">
          Irreemplazable
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm">
          {NAV.filter((n) => n.href !== "/").map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={
                pathname === n.href
                  ? "font-medium text-brand-700"
                  : "text-neutral-600 hover:text-neutral-900"
              }
            >
              {n.label}
            </Link>
          ))}
          <InstallButton />
          <button
            type="button"
            onClick={logout}
            className="text-neutral-600 hover:text-error-fg"
          >
            Salir
          </button>
        </nav>
      </div>
    </header>
  );
}
