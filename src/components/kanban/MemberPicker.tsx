"use client";

import { useState, useTransition } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { addCardMember, removeCardMember } from "@/app/gestao/(dashboard)/kanban/[boardId]/actions";
import type { MemberSummary } from "@/lib/kanban/types";

interface MemberPickerProps {
  boardId: string;
  cardId: string;
  members: MemberSummary[];
  orgMembers: MemberSummary[];
  onChanged: () => void;
}

export function MemberPicker({ boardId, cardId, members, orgMembers, onChanged }: MemberPickerProps) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const memberIds = new Set(members.map((m) => m.id));

  function run(action: Promise<unknown>) {
    startTransition(async () => {
      await action;
      onChanged();
    });
  }

  return (
    <div className="card-modal-sidebar-item">
      <div className="card-modal-section-title">Membros</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", alignItems: "center" }}>
        {members.map((m) => (
          <button
            key={m.id}
            type="button"
            title={`Remover ${m.fullName}`}
            onClick={() => run(removeCardMember(boardId, cardId, m.id))}
            disabled={pending}
          >
            <Avatar name={m.fullName} />
          </button>
        ))}
        <button type="button" className="t-helper" onClick={() => setOpen((o) => !o)}>
          {open ? "fechar" : "+ adicionar"}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: ".625rem", display: "flex", flexDirection: "column", gap: ".375rem" }}>
          {orgMembers
            .filter((m) => !memberIds.has(m.id))
            .map((m) => (
              <button
                key={m.id}
                type="button"
                className="t-body-sm"
                style={{ display: "flex", alignItems: "center", gap: ".5rem", textAlign: "left" }}
                onClick={() => run(addCardMember(boardId, cardId, m.id))}
                disabled={pending}
              >
                <Avatar name={m.fullName} /> {m.fullName}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
