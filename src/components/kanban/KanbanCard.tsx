"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AvatarStack } from "@/components/ui/Avatar";
import { getDueState } from "@/lib/kanban/types";
import type { CardSummary } from "@/lib/kanban/types";

const DUE_LABEL: Record<string, string> = {
  normal: "",
  proximo: "vence em breve",
  atrasado: "atrasado",
  concluido: "concluído",
};

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function KanbanCard({ card, onOpen }: { card: CardSummary; onOpen: () => void }) {
  const isPending = card.id.startsWith("temp-");

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { type: "card", listId: card.listId },
    disabled: isPending,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dueState = getDueState(card.dueDate, card.status);

  return (
    <div
      ref={setNodeRef}
      style={isPending ? { ...style, opacity: 0.5 } : style}
      {...(isPending ? {} : attributes)}
      {...(isPending ? {} : listeners)}
      className={`kanban-card ${isDragging ? "is-dragging" : ""}`}
      onClick={isPending ? undefined : onOpen}
    >
      {card.coverColor && <div className="kanban-card-cover" style={{ background: `var(--off-blue-${card.coverColor.replace("wh-", "")})` }} />}

      {card.labels.length > 0 && (
        <div className="kanban-card-labels">
          {card.labels.map((label) => (
            <span key={label.id} className="kanban-card-label">{label.name}</span>
          ))}
        </div>
      )}

      <div className="kanban-card-title">{card.title}</div>

      <div className="kanban-card-footer">
        <div className="kanban-card-meta">
          {card.priority !== "media" && (
            <span className="kanban-priority" data-level={card.priority}>
              <span className="kanban-priority-bars" aria-hidden="true"><i /><i /><i /></span>
            </span>
          )}
          {card.checklistTotal > 0 && (
            <span className="kanban-card-meta-item">{card.checklistDone}/{card.checklistTotal}</span>
          )}
          {card.commentCount > 0 && (
            <span className="kanban-card-meta-item">{card.commentCount} coment.</span>
          )}
          {card.dueDate && (
            <span className={`kanban-card-due due-${dueState}`} title={DUE_LABEL[dueState]}>
              <span className="dot" aria-hidden="true" />
              {formatDate(card.dueDate)}
            </span>
          )}
        </div>
        {card.members.length > 0 && <AvatarStack names={card.members.map((m) => m.fullName)} max={3} />}
      </div>
    </div>
  );
}
