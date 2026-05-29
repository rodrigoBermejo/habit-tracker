"use client";

import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

const fieldBase =
  "w-full rounded-md border bg-neutral-100 px-3 py-2 text-base text-neutral-800 placeholder:text-neutral-400 disabled:opacity-60";

type InputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid = false, className = "", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={`${fieldBase} min-h-12 ${invalid ? "border-error-fg" : "border-neutral-300"} ${className}`}
      {...props}
    />
  );
});

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { invalid = false, className = "", ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={`${fieldBase} ${invalid ? "border-error-fg" : "border-neutral-300"} ${className}`}
      {...props}
    />
  );
});
