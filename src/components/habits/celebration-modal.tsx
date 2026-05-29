"use client";

import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

/* Celebración sobria de racha 7/30 (criterio 23, sin gamificación agresiva). */
export function CelebrationModal({
  streak,
  onClose,
}: {
  streak: number | null;
  onClose: () => void;
}) {
  if (streak === null) return null;
  return (
    <Modal open onClose={onClose} title={`¡Racha de ${streak}!`}>
      <div className="flex flex-col gap-4">
        <p className="text-base text-neutral-600">Sigue así, un día a la vez.</p>
        <div className="flex justify-end">
          <Button onClick={onClose}>Genial</Button>
        </div>
      </div>
    </Modal>
  );
}
