"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BeveledBox } from "@/components/ui/BeveledBox";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { CreateBoardModal } from "./CreateBoardModal";
import { duplicateBoard, deleteBoard } from "@/app/gestao/(dashboard)/kanban/actions";
import type { BoardSummary } from "@/lib/kanban/types";

export function BoardListView({ boards }: { boards: BoardSummary[] }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Kanban</h1>
          <p className="page-sub">Boards da organização — projetos, times e fluxos de trabalho.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} cornerDots>
          Novo board
        </Button>
      </div>

      {boards.length === 0 ? (
        <div className="ds-card">
          <EmptyState
            title="Nenhum board ainda"
            description="Crie o primeiro board para organizar tarefas em listas e cards."
            action={
              <Button onClick={() => setModalOpen(true)} cornerDots>
                Criar o primeiro board
              </Button>
            }
          />
        </div>
      ) : (
        <div className="kanban-board-grid">
          {boards.map((board) => (
            <BoardTile key={board.id} board={board} />
          ))}
        </div>
      )}

      <CreateBoardModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

function BoardTile({ board }: { board: BoardSummary }) {
  const [pending, startTransition] = useTransition();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  function handleDuplicate(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      try {
        const newId = await duplicateBoard(board.id);
        showToast("Board duplicado.");
        router.push(`/gestao/kanban/${newId}`);
      } catch {
        showToast("Não foi possível duplicar o board — tente novamente.");
      }
    });
  }

  function requestDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirmOpen(true);
  }

  function confirmDelete() {
    startTransition(async () => {
      try {
        await deleteBoard(board.id);
        showToast("Board excluído.");
        setConfirmOpen(false);
        router.refresh();
      } catch {
        setConfirmOpen(false);
        showToast("Não foi possível excluir o board — tente novamente.");
      }
    });
  }

  return (
    <div className="kanban-board-tile-wrap">
      <Link href={`/gestao/kanban/${board.id}`} className="kanban-board-tile-link">
        <BeveledBox bevel={16} className="kanban-board-tile">
          <div className="kanban-board-tile-content">
            <div className="t-h5">{board.name}</div>
            {board.description && <p className="t-body-sm kanban-board-tile-desc">{board.description}</p>}
            <div className="kanban-board-tile-meta">
              <span>{board.listCount} {board.listCount === 1 ? "lista" : "listas"}</span>
              <span>{board.cardCount} {board.cardCount === 1 ? "card" : "cards"}</span>
            </div>
          </div>
        </BeveledBox>
      </Link>
      <div className="kanban-board-tile-actions">
        <button type="button" className="t-helper" onClick={handleDuplicate} disabled={pending}>
          Duplicar
        </button>
        <button type="button" className="t-helper kanban-board-tile-delete" onClick={requestDelete} disabled={pending}>
          Excluir
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`Excluir "${board.name}"?`}
        description="Todas as listas e cards deste board serão apagados. Essa ação não pode ser desfeita."
        confirmLabel="Excluir board"
        pending={pending}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
