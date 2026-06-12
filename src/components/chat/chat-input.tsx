"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatInputProps = {
  onSend: (text: string) => void;
  sending: boolean;
  disabled?: boolean;
};

export function ChatInput({ onSend, sending, disabled = false }: ChatInputProps) {
  const [text, setText] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending || disabled) return;
    onSend(trimmed);
    setText("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t border-neutral-200 px-3 py-3">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Escribe tu pregunta…"
        disabled={disabled}
        aria-label="Pregunta para el asistente"
      />
      <Button type="submit" loading={sending} disabled={disabled || !text.trim()} className="shrink-0">
        Enviar
      </Button>
    </form>
  );
}
