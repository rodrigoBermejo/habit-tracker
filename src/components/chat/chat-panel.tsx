"use client";

import { useEffect } from "react";
import { useOnline } from "@/lib/use-online";
import type { ChatMessage } from "@/lib/api/chat";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";

type ChatPanelProps = {
  messages: ChatMessage[];
  sending: boolean;
  onSend: (text: string) => void;
  onClose: () => void;
};

/* Panel del chatbot (ADR-0005). Cierra con Esc, como el Modal del proyecto. */
export function ChatPanel({ messages, sending, onSend, onClose }: ChatPanelProps) {
  const online = useOnline();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <section
      role="dialog"
      aria-label="Ayuda"
      className="fixed right-4 bottom-20 z-40 flex w-[min(92vw,360px)] flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-modal"
    >
      <header className="flex items-center justify-between border-b border-neutral-200 px-4 py-3">
        <h2 className="text-base font-semibold text-neutral-900">Ayuda</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar ayuda"
          className="text-neutral-500 transition-colors hover:text-neutral-800"
        >
          ✕
        </button>
      </header>
      {!online && (
        <p className="border-warning-fg/20 bg-warning-bg text-warning-fg border-b px-4 py-2 text-center text-sm">
          Sin conexión
        </p>
      )}
      <ChatMessages messages={messages} sending={sending} />
      <ChatInput onSend={onSend} sending={sending} disabled={!online} />
    </section>
  );
}
