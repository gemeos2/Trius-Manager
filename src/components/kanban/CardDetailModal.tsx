"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Badge } from "@/components/ui/Badge";
import { TextareaField } from "@/components/ui/Field";
import { SkeletonCard, SkeletonText } from "@/components/ui/Skeleton";
import { ChecklistSection } from "./ChecklistSection";
import { CommentThread } from "./CommentThread";
import { ActivityLog } from "./ActivityLog";
import { MemberPicker } from "./MemberPicker";
import { LabelPicker } from "./LabelPicker";
import { getCardModalData, updateCard, archiveCard, deleteCard, type CardPatch } from "@/app/gestao/(dashboard)/kanban/[boardId]/actions";
import type { CardDetail, MemberSummary, LabelSummary } from "@/lib/kanban/types";
import type { CardPriority } from "@/types/database";

const PRIORITY_OPTIONS: CardPriority[] = ["baixa", "media", "alta", "urgente"];
const STATUS_DOT: Record<string, "solid" | "hollow" | "cross"> = { aberto: "hollow", "em andamento": "solid", concluido: "solid" };

export function CardDetailModal({ boardId, cardId, onClose }: { boardId: string; cardId: string; onClose: () => void }) {
  const [card, setCard] = useState<CardDetail | null>(null);
  const [orgMembers, setOrgMembers] = useState<MemberSummary[]>([]);
  const [orgLabels, setOrgLabels] = useState<LabelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [titleDraft, setTitleDraft] = useState("");
  const [descDraft, setDescDraft] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [, startTransition] = useTransition();

  const fetchData = useCallback(async () => {
    const result = await getCardModalData(cardId);
    return result;
  }, [cardId]);

  // Recarrega os dados do card sem esconder o conteúdo atual — usado depois
  // de mutações no modal (checklist, comentário, membro, label) que não
  // mudam o cardId e por isso não disparariam o efeito de carga inicial.
  const refetch = useCallback(async () => {
    const result = await fetchData();
    setCard(result.card);
    setOrgMembers(result.members);
    setOrgLabels(result.labels);
  }, [fetchData]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const result = await fetchData();
      if (cancelled) return;
      setCard(result.card);
      setOrgMembers(result.members);
      setOrgLabels(result.labels);
      setTitleDraft(result.card?.title ?? "");
      setDescDraft(result.card?.description ?? "");
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [fetchData]);

  function patch(update: CardPatch) {
    setCard((c) => (c ? { ...c, ...toCardFields(update) } : c));
    startTransition(async () => {
      await updateCard(boardId, cardId, update);
      const result = await fetchData();
      setCard(result.card);
    });
  }

  function toCardFields(update: CardPatch): Partial<CardDetail> {
    const fields: Partial<CardDetail> = {};
    if (update.title !== undefined) fields.title = update.title;
    if (update.description !== undefined) fields.description = update.description;
    if (update.status !== undefined) fields.status = update.status;
    if (update.priority !== undefined) fields.priority = update.priority;
    if (update.start_date !== undefined) fields.startDate = update.start_date;
    if (update.due_date !== undefined) fields.dueDate = update.due_date;
    return fields;
  }

  function handleArchive() {
    startTransition(() => archiveCard(boardId, cardId));
    onClose();
  }

  function confirmDelete() {
    startTransition(() => deleteCard(boardId, cardId));
    setDeleteConfirmOpen(false);
    onClose();
  }

  return (
    <Modal open onClose={onClose} size="lg">
      {loading || !card ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <SkeletonText style={{ height: "1.5rem", width: "60%" }} />
          <SkeletonCard />
        </div>
      ) : (
        <>
          <div className="card-modal-header">
            <input
              className="card-modal-title"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => titleDraft.trim() && titleDraft !== card.title && patch({ title: titleDraft.trim() })}
            />
          </div>

          <div className="card-modal-badges">
            <Badge label={card.status} dot={STATUS_DOT[card.status] ?? "hollow"} />
            <select
              className="ds-input"
              style={{ width: "auto", padding: ".4rem .75rem", fontSize: ".6875rem" }}
              value={card.priority}
              onChange={(e) => patch({ priority: e.target.value as CardPriority })}
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="card-modal-grid">
            <div>
              <div className="card-modal-section">
                <div className="card-modal-section-title">Descrição</div>
                <TextareaField
                  id="card-description"
                  label=""
                  rows={4}
                  value={descDraft}
                  onChange={(e) => setDescDraft(e.target.value)}
                  onBlur={() => descDraft !== (card.description ?? "") && patch({ description: descDraft || null })}
                />
              </div>

              <ChecklistSection boardId={boardId} cardId={cardId} checklists={card.checklists} onChanged={refetch} />
              <CommentThread boardId={boardId} cardId={cardId} comments={card.comments} onChanged={refetch} />
            </div>

            <div>
              <MemberPicker boardId={boardId} cardId={cardId} members={card.members} orgMembers={orgMembers} onChanged={refetch} />
              <LabelPicker boardId={boardId} cardId={cardId} labels={card.labels} orgLabels={orgLabels} onChanged={refetch} />

              <div className="card-modal-sidebar-item">
                <div className="card-modal-section-title">Datas</div>
                <label className="t-helper" style={{ display: "block", marginBottom: ".25rem" }}>Início</label>
                <input
                  className="ds-input"
                  type="date"
                  value={card.startDate ?? ""}
                  onChange={(e) => patch({ start_date: e.target.value || null })}
                  style={{ marginBottom: ".75rem" }}
                />
                <label className="t-helper" style={{ display: "block", marginBottom: ".25rem" }}>Prazo</label>
                <input
                  className="ds-input"
                  type="date"
                  value={card.dueDate ?? ""}
                  onChange={(e) => patch({ due_date: e.target.value || null })}
                />
              </div>

              {(card.clientName || card.projectName) && (
                <div className="card-modal-sidebar-item">
                  <div className="card-modal-section-title">Vínculos</div>
                  {card.clientName && <div className="t-body-sm">Cliente: {card.clientName}</div>}
                  {card.projectName && <div className="t-body-sm">Projeto: {card.projectName}</div>}
                </div>
              )}

              <div className="card-modal-sidebar-item" style={{ display: "flex", gap: ".75rem" }}>
                <button type="button" className="t-helper" onClick={handleArchive}>Arquivar</button>
                <button type="button" className="t-helper" onClick={() => setDeleteConfirmOpen(true)}>Excluir</button>
              </div>

              <ActivityLog activity={card.activity} />
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Excluir este card?"
        description="Essa ação não pode ser desfeita."
        confirmLabel="Excluir card"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </Modal>
  );
}
