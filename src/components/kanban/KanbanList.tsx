"use client";

import { useState } from "react";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { KanbanCard } from "./KanbanCard";
import type { ListWithCards } from "@/lib/kanban/types";

interface KanbanListProps {
  list: ListWithCards;
  onOpenCard: (cardId: string) => void;
  onAddCard: (listId: string, title: string) => void;
  onRenameList: (listId: string, name: string) => void;
  onArchiveList: (listId: string) => void;
}

export function KanbanList({ list, onOpenCard, onAddCard, onRenameList, onArchiveList }: KanbanListProps) {
  const isPending = list.id.startsWith("temp-");
  const [addingCard, setAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [nameDraft, setNameDraft] = useState(list.name);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: list.id,
    data: { type: "list" },
    disabled: isPending,
  });

  const { setNodeRef: setDroppableRef } = useDroppable({ id: list.id, data: { type: "list" }, disabled: isPending });

  const style = { transform: CSS.Transform.toString(transform), transition };

  function submitCard() {
    const title = cardTitle.trim();
    if (title) onAddCard(list.id, title);
    setCardTitle("");
    setAddingCard(false);
  }

  function submitRename() {
    const name = nameDraft.trim();
    if (name && name !== list.name) onRenameList(list.id, name);
    setRenaming(false);
  }

  return (
    <div ref={setNodeRef} style={isPending ? { ...style, opacity: 0.5 } : style} className="kanban-list">
      <div className="kanban-list-header" {...(isPending ? {} : attributes)} {...(isPending ? {} : listeners)}>
        {renaming ? (
          <input
            className="ds-input"
            style={{ padding: ".25rem .5rem", fontSize: ".8125rem" }}
            value={nameDraft}
            autoFocus
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={submitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitRename();
              if (e.key === "Escape") { setNameDraft(list.name); setRenaming(false); }
            }}
          />
        ) : (
          <span className="kanban-list-title" onClick={() => setRenaming(true)}>{list.name}</span>
        )}
        <span className="kanban-list-count">{list.cards.length}</span>
        <button
          type="button"
          className="ds-btn"
          style={{ fontSize: "1rem", lineHeight: 1, color: "var(--off-blue-40)" }}
          onClick={() => onArchiveList(list.id)}
          aria-label="Arquivar lista"
          title="Arquivar lista"
        >
          ×
        </button>
      </div>

      <div ref={setDroppableRef} className="kanban-list-body">
        <SortableContext items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <KanbanCard key={card.id} card={card} onOpen={() => onOpenCard(card.id)} />
          ))}
        </SortableContext>
      </div>

      <div className="kanban-list-add">
        {isPending ? (
          <span className="t-body-sm" style={{ color: "var(--off-blue-30)" }}>Salvando lista…</span>
        ) : addingCard ? (
          <input
            className="ds-input"
            placeholder="Título do card"
            value={cardTitle}
            autoFocus
            onChange={(e) => setCardTitle(e.target.value)}
            onBlur={submitCard}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitCard();
              if (e.key === "Escape") { setCardTitle(""); setAddingCard(false); }
            }}
          />
        ) : (
          <button type="button" className="t-body-sm" style={{ color: "var(--off-blue-60)" }} onClick={() => setAddingCard(true)}>
            + Adicionar card
          </button>
        )}
      </div>
    </div>
  );
}
