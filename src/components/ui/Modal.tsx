"use client";

import { useEffect, useState, type ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: "md" | "lg";
}

type Phase = "closed" | "open" | "closing";

export function Modal({ open, onClose, children, size = "md" }: ModalProps) {
  const [phase, setPhase] = useState<Phase>(open ? "open" : "closed");
  const [prevOpen, setPrevOpen] = useState(open);

  // Deriva a fase a partir da prop `open` durante o render (padrão
  // recomendado pelo React para "ajustar estado ao mudar props", em vez de
  // um useEffect disparando setState de forma síncrona).
  if (open !== prevOpen) {
    setPrevOpen(open);
    setPhase(open ? "open" : "closing");
  }

  useEffect(() => {
    if (phase !== "closing") return;
    const t = setTimeout(() => setPhase("closed"), 300);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "closed") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [phase, onClose]);

  if (phase === "closed") return null;

  return (
    <div className={`modal-root ${phase === "open" ? "is-open" : ""} ${phase === "closing" ? "is-closing" : ""}`} role="dialog" aria-modal="true">
      <div className="modal-backdrop" onClick={onClose} />
      <div className={`modal-panel ${size === "lg" ? "modal-lg" : ""}`}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
