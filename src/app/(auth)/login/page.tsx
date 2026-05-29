"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export default function LoginPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signInError) {
      setError("Email o contraseña incorrectos");
      return;
    }
    router.replace("/");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-neutral-900">Inicia sesión</h1>
      <Field label="Email" htmlFor="email">
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label="Contraseña" htmlFor="password" error={error}>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          invalid={!!error}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      <Button type="submit" loading={loading}>
        Entrar
      </Button>
      <div className="flex flex-col gap-1 text-sm">
        <Link href="/reset" className="text-brand-700 hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
        <span className="text-neutral-500">
          ¿No tienes cuenta?{" "}
          <Link href="/signup" className="text-brand-700 hover:underline">
            Crear cuenta
          </Link>
        </span>
      </div>
    </form>
  );
}
