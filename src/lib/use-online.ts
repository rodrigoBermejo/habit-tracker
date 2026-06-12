"use client";

import { useEffect, useState } from "react";

/*
  Estado de conexión del navegador (criterio 35). Empieza optimista en `true`
  para no parpadear en SSR/primer render; se corrige al montar.
*/
export function useOnline() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return online;
}
