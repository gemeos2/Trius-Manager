"use client";

import { useState, useTransition } from "react";
import { applyLabel, createLabel, removeLabel } from "@/app/gestao/(dashboard)/kanban/[boardId]/actions";
import type { LabelSummary } from "@/lib/kanban/types";

interface LabelPickerProps {
  boardId: string;
  cardId: string;
  labels: LabelSummary[];
  orgLabels: LabelSummary[];
  onChanged: () => void;
}

export function LabelPicker({ boardId, cardId, labels, orgLabels, onChanged }: LabelPickerProps) {
  const [open, setOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [pending, startTransition] = useTransition();
  const labelIds = new Set(labels.map((l) => l.id));

  function run(action: Promise<unknown>) {
    startTransition(async () => {
      await action;
      onChanged();
    });
  }

  function handleCreate() {
    const name = newLabel.trim();
    if (!name) return;
    run(
      (async () => {
        const id = await createLabel(boardId, name, "wh-40");
        await applyLabel(boardId, cardId, id);
      })()
    );
    setNewLabel("");
  }

  return (
    <div className="card-modal-sidebar-item">
      <div className="card-modal-section-title">Labels</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: ".375rem" }}>
        {labels.map((l) => (
          <button
            key={l.id}
            type="button"
            className="kanban-card-label"
            title="Remover"
            onClick={() => run(removeLabel(boardId, cardId, l.id))}
            disabled={pending}
          >
            {l.name} ×
          </button>
        ))}
        <button type="button" className="t-helper" onClick={() => setOpen((o) => !o)}>
          {open ? "fechar" : "+ adicionar"}
        </button>
      </div>

      {open && (
        <div style={{ marginTop: ".625rem", display: "flex", flexDirection: "column", gap: ".375rem" }}>
          {orgLabels
            .filter((l) => !labelIds.has(l.id))
            .map((l) => (
              <button
                key={l.id}
                type="button"
                className="t-body-sm"
                style={{ textAlign: "left" }}
                onClick={() => run(applyLabel(boardId, cardId, l.id))}
                disabled={pending}
              >
                {l.name}
              </button>
            ))}
          <div style={{ display: "flex", gap: ".375rem", marginTop: ".25rem" }}>
            <input
              className="ds-input"
              placeholder="Nova label"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
