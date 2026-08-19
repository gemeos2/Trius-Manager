"use client";

import { useState, useTransition } from "react";
import { Checkbox } from "@/components/ui/Checkbox";
import { Progress } from "@/components/ui/Progress";
import {
  addChecklistItem,
  createChecklist,
  deleteChecklist,
  deleteChecklistItem,
  toggleChecklistItem,
} from "@/app/gestao/(dashboard)/kanban/[boardId]/actions";
import type { ChecklistDetail } from "@/lib/kanban/types";

interface ChecklistSectionProps {
  boardId: string;
  cardId: string;
  checklists: ChecklistDetail[];
  onChanged: () => void;
}

export function ChecklistSection({ boardId, cardId, checklists, onChanged }: ChecklistSectionProps) {
  const [pending, startTransition] = useTransition();
  const [addingChecklist, setAddingChecklist] = useState(false);
  const [checklistTitle, setChecklistTitle] = useState("");

  function run(action: Promise<unknown>) {
    startTransition(async () => {
      await action;
      onChanged();
    });
  }

  function handleCreateChecklist() {
    const title = checklistTitle.trim() || "Checklist";
    run(createChecklist(boardId, cardId, title));
    setChecklistTitle("");
    setAddingChecklist(false);
  }

  return (
    <div className="card-modal-section">
      <div className="card-modal-section-title">Checklists</div>

      {checklists.map((checklist) => (
        <div key={checklist.id} className="checklist-block">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: ".5rem" }}>
            <span className="t-body-sm" style={{ fontFamily: "var(--ff-bold)" }}>{checklist.title}</span>
            <button
              type="button"
              className="t-helper"
              onClick={() => run(deleteChecklist(boardId, checklist.id))}
              disabled={pending}
            >
              Excluir
            </button>
          </div>

          {checklist.items.length > 0 && (
            <Progress value={checklist.items.filter((i) => i.done).length} total={checklist.items.length} />
          )}

          {checklist.items.map((item) => (
            <div key={item.id} className={`checklist-item-row ${item.done ? "is-done" : ""}`}>
              <Checkbox
                id={`item-${item.id}`}
                label={item.title}
                checked={item.done}
                onChange={(e) => run(toggleChecklistItem(boardId, item.id, e.target.checked))}
              />
              <button
                type="button"
                className="t-helper"
                onClick={() => run(deleteChecklistItem(boardId, item.id))}
              >
                ×
              </button>
            </div>
          ))}

          <ChecklistItemForm boardId={boardId} checklistId={checklist.id} onChanged={onChanged} />
        </div>
      ))}

      {addingChecklist ? (
        <input
          className="ds-input"
          placeholder="Nome do checklist"
          value={checklistTitle}
          autoFocus
          onChange={(e) => setChecklistTitle(e.target.value)}
          onBlur={handleCreateChecklist}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreateChecklist();
            if (e.key === "Escape") { setChecklistTitle(""); setAddingChecklist(false); }
          }}
        />
      ) : (
        <button type="button" className="t-body-sm" style={{ color: "var(--off-blue-60)" }} onClick={() => setAddingChecklist(true)}>
          + Novo checklist
        </button>
      )}
    </div>
  );
}

function ChecklistItemForm({ boardId, checklistId, onChanged }: { boardId: string; checklistId: string; onChanged: () => void }) {
  const [title, setTitle] = useState("");
  const [pending, startTransition] = useTransition();

  function submit() {
    const value = title.trim();
    if (!value) return;
    startTransition(async () => {
      await addChecklistItem(boardId, checklistId, value);
      onChanged();
    });
    setTitle("");
  }

  return (
    <div className="checklist-add-row">
      <input
        className="ds-input"
        placeholder="Adicionar item"
        value={title}
        disabled={pending}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />
    </div>
  );
}
