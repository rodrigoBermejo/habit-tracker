"use client";

import { useCallback, useState } from "react";
import { sendChatMessage, type ChatMessage } from "@/lib/api/chat";

const SESSION_KEY = "chat-session-id";

/* Vive por pestaña: al cerrarla empieza conversación nueva, igual que la
   memoria del agente en n8n (llaveada por este mismo id). */
function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/* Estado del chatbot de ayuda (ADR-0005). El historial visual es solo memoria
   de React; los errores se muestran como burbuja inline, no como toast. */
export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);

  const send = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: trimmed },
    ]);
    setSending(true);
    try {
      const reply = await sendChatMessage(trimmed, getSessionId());
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: reply },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "No se pudo obtener respuesta. Intenta de nuevo.",
          error: true,
        },
      ]);
    } finally {
      setSending(false);
    }
  }, []);

  return { messages, sending, send };
}
