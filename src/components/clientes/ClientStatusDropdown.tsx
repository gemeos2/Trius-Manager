"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/ToastProvider";
import { updateClientAction } from "@/app/gestao/(dashboard)/clientes/actions";
import { CLIENT_STATUS_LABEL, CLIENT_STATUS_OPTIONS } from "@/lib/clientes/types";
import type { ClientStatus } from "@/types/database";

const STATUS_DOT: Record<ClientStatus, "solid" | "hollow" | "cross" | "positive"> = {
  lead: "hollow",
  proposta: "hollow",
  ativo: "positive",
  pausa: "hollow",
  inadimplente: "cross",
  cancelado: "cross",
};

export function ClientStatusDropdown({ clientId, status }: { clientId: string; status: ClientStatus }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [pending, startTransition] = useTransition();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    if (!open) return;

    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) setMenuPos({ top: rect.bottom + 8, left: rect.left });
    }

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    function onClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  function handleSelect(next: ClientStatus) {
    setOpen(false);
    if (next === status) return;
    startTransition(async () => {
      try {
        await updateClientAction(clientId, { status: next });
        showToast("Status atualizado.");
        router.refresh();
      } catch {
        showToast("Não foi possível atualizar o status — tente novamente.");
      }
    });
  }

  return (
    <div className="client-status-dropdown" onClick={(e) => e.stopPropagation()}>
      <button type="button" className="client-status-trigger" ref={triggerRef} disabled={pending} onClick={() => setOpen((v) => !v)}>
        <Badge label={CLIENT_STATUS_LABEL[status]} dot={STATUS_DOT[status]} />
      </button>
      {open &&
        createPortal(
          <div className="client-status-menu" role="menu" ref={menuRef} style={{ top: menuPos.top, left: menuPos.left }}>
            {CLIENT_STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                role="menuitem"
                className={`client-status-menu-item ${s === status ? "is-current" : ""}`}
                onClick={() => handleSelect(s)}
              >
                <Badge label={CLIENT_STATUS_LABEL[s]} dot={STATUS_DOT[s]} />
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
