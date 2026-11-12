"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Modale basée sur l'élément natif <dialog> : piège du focus, touche Échap
 * et restitution du focus à la fermeture sont gérés par le navigateur.
 */
export function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      // Clic sur l'arrière-plan : le clic atteint le <dialog> lui-même.
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className={cn(
        "m-auto w-[min(34rem,calc(100vw-2rem))] rounded-panel bg-white p-0 text-ink shadow-float",
        "open:animate-[lp-rise_0.4s_var(--ease-soft)]",
        className,
      )}
    >
      <div className="flex flex-col gap-5 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id={titleId} className="type-h3">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
            className="-mt-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-mist"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        <div className="text-[0.9375rem] leading-relaxed text-charcoal">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-3 pt-2">{footer}</div>}
      </div>
    </dialog>
  );
}
