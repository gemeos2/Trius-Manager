import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getBoards } from "@/lib/kanban/queries";
import { BoardListView } from "@/components/kanban/BoardListView";

export const metadata: Metadata = { title: "Kanban — TRIUS" };

export default async function KanbanPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/gestao/login");

  const boards = user.organizationId ? await getBoards(user.organizationId) : [];

  return <BoardListView boards={boards} />;
}
