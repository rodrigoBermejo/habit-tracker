"use client";

import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

/* Modal de límite de hábitos (criterios 10, 12). */
export function LimitModal({
  open,
  onClose,
  isPremium,
}: {
  open: boolean;
  onClose: () => void;
  isPremium: boolean;
}) {
  const router = useRouter();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        isPremium
          ? "Alcanzaste el límite de 30 hábitos activos"
          : "Alcanzaste el límite de 3 hábitos. Sube a Premium para crear más"
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-base text-neutral-600">
          {isPremium
            ? "Archiva alguno para crear uno nuevo."
            : "Premium te permite hasta 30 hábitos activos y estadísticas."}
        </p>
        <div className="flex justify-end gap-2">
          {isPremium ? (
            <Button onClick={onClose}>Entendido</Button>
          ) : (
            <>
              <Button variant="secondary" onClick={onClose}>
                Ahora no
              </Button>
              <Button onClick={() => router.push("/cuenta")}>Subir a Premium</Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
