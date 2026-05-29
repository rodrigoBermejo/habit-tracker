"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/* Compartir racha vía Web Share API (criterio 34). Oculto si no hay soporte
   o si la racha es 0. */
export function ShareButton({ name, streak }: { name: string; streak: number }) {
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  if (!canShare || streak < 1) return null;

  async function share() {
    try {
      await navigator.share({ text: `Llevo ${streak} días con ${name}` });
    } catch {
      // El usuario canceló: no es error.
    }
  }

  return (
    <Button variant="secondary" onClick={share}>
      Compartir racha
    </Button>
  );
}
