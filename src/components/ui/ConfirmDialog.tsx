"use client";

import { Modal } from "./Modal";
import { Button } from "./Button";

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Substitui window.confirm() — mesmo modal do design system, em vez do
 * diálogo nativo do navegador que quebra a identidade visual do app.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = true,
  pending = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel}>
      <h2 className="t-h5" style={{ marginBottom: description ? ".75rem" : "1.5rem" }}>{title}</h2>
      {description && (
        <p className="t-body-sm" style={{ color: "var(--off-blue-60)", marginBottom: "1.5rem" }}>
          {description}
        </p>
      )}
      <div style={{ display: "flex", gap: ".75rem" }}>
        <Button variant="transparent" onClick={onCancel} disabled={pending}>
          {cancelLabel}
        </Button>
        <Button variant={destructive ? "solid-light" : "solid-dark"} onClick={onConfirm} loading={pending}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
