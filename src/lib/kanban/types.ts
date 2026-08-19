import type { CardPriority } from "@/types/database";

export interface BoardSummary {
  id: string;
  name: string;
  description: string | null;
  projectId: string | null;
  createdAt: string;
  listCount: number;
  cardCount: number;
}

export interface MemberSummary {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface LabelSummary {
  id: string;
  name: string;
  colorToken: string;
}

export interface CardSummary {
  id: string;
  listId: string;
  title: string;
  description: string | null;
  status: string;
  priority: CardPriority;
  position: number;
  startDate: string | null;
  dueDate: string | null;
  clientId: string | null;
  clientName: string | null;
  projectId: string | null;
  projectName: string | null;
  coverColor: string | null;
  members: MemberSummary[];
  labels: LabelSummary[];
  checklistTotal: number;
  checklistDone: number;
  commentCount: number;
}

export interface ListWithCards {
  id: string;
  boardId: string;
  name: string;
  position: number;
  cards: CardSummary[];
}

export interface BoardWithLists {
  id: string;
  organizationId: string;
  projectId: string | null;
  name: string;
  description: string | null;
  lists: ListWithCards[];
}

export interface ChecklistItemDetail {
  id: string;
  title: string;
  done: boolean;
  assigneeId: string | null;
  position: number;
}

export interface ChecklistDetail {
  id: string;
  title: string;
  position: number;
  items: ChecklistItemDetail[];
}

export interface CommentDetail {
  id: string;
  body: string;
  createdAt: string;
  authorId: string | null;
  authorName: string;
}

export interface ActivityEntry {
  id: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  authorId: string | null;
  authorName: string;
}

export interface CardDetail extends CardSummary {
  checklists: ChecklistDetail[];
  comments: CommentDetail[];
  activity: ActivityEntry[];
}

export type DueState = "normal" | "proximo" | "atrasado" | "concluido";

export function getDueState(dueDate: string | null, status: string): DueState {
  if (status === "concluido") return "concluido";
  if (!dueDate) return "normal";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate + "T00:00:00");
  const diffDays = Math.round((due.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) return "atrasado";
  if (diffDays <= 2) return "proximo";
  return "normal";
}
