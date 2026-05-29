"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

function ResetInner() {
  const router = useRouter();
  const params = useSearchParams();
  const supabase = getSupabaseBrowserClient();

  // Si llega ?code= desde el email, estamos en modo "definir nueva contraseña".
  const code = params.get("code");
  const [mode, setMode] = useState<"request" | "set">(code ? "set" : "request");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error: exErr }) => {
        if (exErr) setError("El enlace de recuperación no es válido o expiró");
        else setMode("set");
      });
    }
  }, [code, supabase]);

  async function onRequest(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
    const { error: reqErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${appUrl}/reset`,
    });
    setLoading(false);
    if (reqErr) {
      setError("No se pudo enviar el correo, intenta de nuevo");
      return;
    }
    setSent(true);
  }

  async function onSetPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: updErr } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updErr) {
      setError("No se pudo actualizar la contraseña");
      return;
    }
    router.replace("/");
  }

  if (mode === "set") {
    return (
      <form onSubmit={onSetPassword} className="flex flex-col gap-4">
        <h1 className="text-2xl font-semibold text-neutral-900">Nueva contraseña</h1>
        <Field label="Nueva contraseña" htmlFor="password" error={error} hint="Mínimo 6 caracteres">
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            invalid={!!error}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Button type="submit" loading={loading}>
          Guardar contraseña
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={onRequest} className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-neutral-900">Recuperar contraseña</h1>
      {sent ? (
        <p className="text-sm text-neutral-600">
          Revisa tu correo: te enviamos un enlace para definir una nueva contraseña.
        </p>
      ) : (
        <>
          <Field label="Email" htmlFor="email" error={error}>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              invalid={!!error}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>
          <Button type="submit" loading={loading}>
            Enviar enlace
          </Button>
        </>
      )}
      <Link href="/login" className="text-sm text-brand-700 hover:underline">
        Volver a iniciar sesión
      </Link>
    </form>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={null}>
      <ResetInner />
    </Suspense>
  );
}
