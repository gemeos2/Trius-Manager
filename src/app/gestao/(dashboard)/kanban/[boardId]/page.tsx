import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getBoardWithLists } from "@/lib/kanban/queries";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";

export const metadata: Metadata = { title: "Board — TRIUS" };

export default async function BoardPage({ params }: { params: Promise<{ boardId: string }> }) {
  const { boardId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/gestao/login");
  if (!user.organizationId) redirect("/gestao/configuracoes");

  const board = await getBoardWithLists(boardId, user.organizationId);
  if (!board) notFound();

  return (
    <>
      <div className="kanban-board-header">
        <div>
          <Link href="/gestao/kanban" className="kanban-board-back">← Boards</Link>
          <h1 className="page-title">{board.name}</h1>
          {board.description && <p className="page-sub">{board.description}</p>}
        </div>
      </div>

      <Suspense fallback={null}>
        <KanbanBoard initialData={board} currentUserId={user.id} />
      </Suspense>
    </>
  );
}
