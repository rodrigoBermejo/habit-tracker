"use client";

import { useState } from "react";
import { useChat } from "@/lib/hooks/use-chat";
import { ChatPanel } from "./chat-panel";

/* Chatbot de ayuda (ADR-0005): botón flotante + panel en rutas autenticadas.
   El estado vive aquí (montado en el layout) para que el historial sobreviva
   a la navegación y al cierre del panel. */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const { messages, sending, send } = useChat();

  return (
    <>
      {open && (
        <ChatPanel
          messages={messages}
          sending={sending}
          onSend={send}
          onClose={() => setOpen(false)}
        />
      )}
      <button
        type="button"
        aria-label={open ? "Cerrar ayuda" : "Abrir ayuda"}
        onClick={() => setOpen((v) => !v)}
        className="shadow-pop fixed right-4 bottom-4 z-40 flex size-12 items-center justify-center rounded-full bg-brand-600 text-xl font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-50 focus-visible:outline-none"
      >
        {open ? "✕" : "?"}
      </button>
    </>
  );
}
