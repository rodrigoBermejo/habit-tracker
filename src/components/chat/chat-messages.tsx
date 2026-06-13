"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { ChatMessage } from "@/lib/api/chat";

const WELCOME =
  "¡Va! Soy tu coach del reto. Pregúntame cómo va el reto, cómo resolver la tarea de hoy o cómo funcionan las rachas. Ponte perro.";

type ChatMessagesProps = {
  messages: ChatMessage[];
  sending: boolean;
};

export function ChatMessages({ messages, sending }: ChatMessagesProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length, sending]);

  return (
    <div className="flex max-h-[50vh] min-h-40 flex-col gap-2 overflow-y-auto px-4 py-3">
      <Bubble role="assistant">{WELCOME}</Bubble>
      {messages.map((m) => (
        <Bubble key={m.id} role={m.role} error={m.error}>
          {m.content}
        </Bubble>
      ))}
      {sending && (
        <Bubble role="assistant">
          <span className="animate-pulse">Escribiendo…</span>
        </Bubble>
      )}
      <div ref={endRef} />
    </div>
  );
}

function Bubble({
  role,
  error = false,
  children,
}: {
  role: "user" | "assistant";
  error?: boolean;
  children: ReactNode;
}) {
  const styles = error
    ? "self-start bg-error-bg text-error-fg"
    : role === "user"
      ? "self-end bg-brand-600 text-white"
      : "self-start bg-neutral-100 text-neutral-800";
  return (
    <p className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${styles}`}>
      {children}
    </p>
  );
}
