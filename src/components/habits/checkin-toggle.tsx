"use client";

/* Toggle de check-in del día (docs/diseno.md §2.3, criterio 18). */
export function CheckinToggle({
  done,
  loading = false,
  disabled = false,
  onToggle,
}: {
  done: boolean;
  loading?: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={done}
      aria-label={done ? "Marcado como hecho" : "Marcar como hecho"}
      disabled={disabled || loading}
      onClick={onToggle}
      className={`flex size-12 shrink-0 items-center justify-center rounded-full border-2 transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        done
          ? "border-cell-done bg-cell-done text-white"
          : "border-neutral-300 bg-white text-neutral-400"
      }`}
    >
      {loading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={3}>
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
