"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/ui/field";

export default function SignupPage() {
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
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);

    // Email ya registrado (criterio 2). Supabase puede devolver error o, con
    // confirmación de email, un user con identities vacío (ofuscado).
    const alreadyExists =
      (signUpError && /already|registered|exists/i.test(signUpError.message)) ||
      (data?.user && data.user.identities && data.user.identities.length === 0);

    if (alreadyExists) {
      setError("Ese email ya tiene cuenta");
      return;
    }
    if (signUpError) {
      setError("No se pudo crear la cuenta, intenta de nuevo");
      return;
    }
    router.replace("/onboarding");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-neutral-900">Crea tu cuenta</h1>
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
      <Field label="Contraseña" htmlFor="password" hint="Mínimo 6 caracteres">
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Field>
      <Button type="submit" loading={loading}>
        Crear cuenta
      </Button>
      <span className="text-sm text-neutral-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-brand-700 hover:underline">
          Inicia sesión
        </Link>
      </span>
    </form>
  );
}
