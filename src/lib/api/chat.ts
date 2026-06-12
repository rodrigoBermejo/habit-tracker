/* Cliente del chatbot de ayuda (ADR-0005): webhook n8n externo.
   Contrato: POST { message, sessionId } -> 200 { reply: string }. */

export class ChatUnavailableError extends Error {
  constructor() {
    super("No se pudo obtener respuesta. Intenta de nuevo.");
    this.name = "ChatUnavailableError";
  }
}

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  error?: boolean;
};

export async function sendChatMessage(message: string, sessionId: string): Promise<string> {
  const url = process.env.NEXT_PUBLIC_CHAT_WEBHOOK_URL;
  if (!url) throw new ChatUnavailableError();

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, sessionId }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    throw new ChatUnavailableError();
  }
  if (!res.ok) throw new ChatUnavailableError();

  const data: unknown = await res.json().catch(() => null);
  const reply = (data as { reply?: unknown } | null)?.reply;
  if (typeof reply !== "string" || reply.length === 0) throw new ChatUnavailableError();
  return reply;
}
