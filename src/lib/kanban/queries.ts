import { createClient } from "@/lib/supabase/server";
import type {
  ActivityEntry,
  BoardSummary,
  BoardWithLists,
  CardDetail,
  CardSummary,
  ChecklistDetail,
  CommentDetail,
  LabelSummary,
  MemberSummary,
} from "./types";

export async function getBoards(organizationId: string): Promise<BoardSummary[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("boards")
    .select("id, name, description, project_id, created_at, board_lists(id, board_cards(id))")
    .eq("organization_id", organizationId)
    .is("archived_at", null)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((board) => {
    const lists = (board.board_lists ?? []) as Array<{ id: string; board_cards: { id: string }[] | null }>;
    return {
      id: board.id,
      name: board.name,
      description: board.description,
      projectId: board.project_id,
      createdAt: board.created_at,
      listCount: lists.length,
      cardCount: lists.reduce((sum, l) => sum + (l.board_cards?.length ?? 0), 0),
    };
  });
}

interface RawCardRow {
  id: string;
  list_id: string;
  title: string;
  description: string | null;
  status: string;
  priority: CardSummary["priority"];
  position: number;
  start_date: string | null;
  due_date: string | null;
  client_id: string | null;
  clients: { name: string } | null;
  project_id: string | null;
  projects: { name: string } | null;
  cover_color: string | null;
  card_members: { profiles: { id: string; full_name: string; avatar_url: string | null } | null }[] | null;
  card_labels: { labels: { id: string; name: string; color_token: string } | null }[] | null;
  checklists: { checklist_items: { done: boolean }[] | null }[] | null;
  card_comments: { id: string }[] | null;
}

function mapCard(row: RawCardRow): CardSummary {
  const members: MemberSummary[] = (row.card_members ?? [])
    .map((m) => m.profiles)
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({ id: p.id, fullName: p.full_name, avatarUrl: p.avatar_url }));

  const labels: LabelSummary[] = (row.card_labels ?? [])
    .map((l) => l.labels)
    .filter((l): l is NonNullable<typeof l> => Boolean(l))
    .map((l) => ({ id: l.id, name: l.name, colorToken: l.color_token }));

  const checklistItems = (row.checklists ?? []).flatMap((c) => c.checklist_items ?? []);

  return {
    id: row.id,
    listId: row.list_id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    position: row.position,
    startDate: row.start_date,
    dueDate: row.due_date,
    clientId: row.client_id,
    clientName: row.clients?.name ?? null,
    projectId: row.project_id,
    projectName: row.projects?.name ?? null,
    coverColor: row.cover_color,
    members,
    labels,
    checklistTotal: checklistItems.length,
    checklistDone: checklistItems.filter((i) => i.done).length,
    commentCount: row.card_comments?.length ?? 0,
  };
}

const CARD_SELECT = `
  id, list_id, title, description, status, priority, position, start_date, due_date,
  client_id, clients(name), project_id, projects(name), cover_color,
  card_members(profiles(id, full_name, avatar_url)),
  card_labels(labels(id, name, color_token)),
  checklists(checklist_items(done)),
  card_comments(id)
`;

export async function getBoardWithLists(boardId: string, organizationId: string): Promise<BoardWithLists | null> {
  const supabase = await createClient();

  const { data: board, error: boardError } = await supabase
    .from("boards")
    .select("id, organization_id, project_id, name, description")
    .eq("id", boardId)
    .eq("organization_id", organizationId)
    .is("archived_at", null)
    .single();

  if (boardError || !board) return null;

  const { data: lists, error: listsError } = await supabase
    .from("board_lists")
    .select(`id, board_id, name, position, board_cards(${CARD_SELECT})`)
    .eq("board_id", boardId)
    .is("archived_at", null)
    .order("position", { ascending: true });

  if (listsError || !lists) {
    return { id: board.id, organizationId: board.organization_id, projectId: board.project_id, name: board.name, description: board.description, lists: [] };
  }

  return {
    id: board.id,
    organizationId: board.organization_id,
    projectId: board.project_id,
    name: board.name,
    description: board.description,
    lists: lists.map((list) => {
      const cards = ((list.board_cards ?? []) as RawCardRow[]).map(mapCard).sort((a, b) => a.position - b.position);
      return {
        id: list.id,
        boardId: list.board_id,
        name: list.name,
        position: list.position,
        cards,
      };
    }),
  };
}

export async function getOrgMembers(organizationId: string): Promise<MemberSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("organization_id", organizationId)
    .order("full_name", { ascending: true });

  return (data ?? []).map((p) => ({ id: p.id, fullName: p.full_name, avatarUrl: p.avatar_url }));
}

export async function getOrgLabels(organizationId: string): Promise<LabelSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("labels")
    .select("id, name, color_token")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  return (data ?? []).map((l) => ({ id: l.id, name: l.name, colorToken: l.color_token }));
}

export async function getCardDetail(cardId: string): Promise<CardDetail | null> {
  const supabase = await createClient();

  const { data: card, error } = await supabase
    .from("board_cards")
    .select(CARD_SELECT)
    .eq("id", cardId)
    .single();

  if (error || !card) return null;

  const { data: checklistsRaw } = await supabase
    .from("checklists")
    .select("id, title, position, checklist_items(id, title, done, assignee_id, position)")
    .eq("card_id", cardId)
    .order("position", { ascending: true });

  const checklists: ChecklistDetail[] = (checklistsRaw ?? []).map((cl) => ({
    id: cl.id,
    title: cl.title,
    position: cl.position,
    items: (cl.checklist_items ?? [])
      .map((i) => ({ id: i.id, title: i.title, done: i.done, assigneeId: i.assignee_id, position: i.position }))
      .sort((a, b) => a.position - b.position),
  }));

  const { data: commentsRaw } = await supabase
    .from("card_comments")
    .select("id, body, created_at, user_id, profiles(full_name)")
    .eq("card_id", cardId)
    .order("created_at", { ascending: true });

  const comments: CommentDetail[] = (commentsRaw ?? []).map((c) => ({
    id: c.id,
    body: c.body,
    createdAt: c.created_at,
    authorId: c.user_id,
    authorName: (c.profiles as unknown as { full_name: string } | null)?.full_name ?? "Usuário removido",
  }));

  const { data: activityRaw } = await supabase
    .from("activities")
    .select("id, action, metadata, created_at, user_id, profiles(full_name)")
    .eq("entity_type", "board_card")
    .eq("entity_id", cardId)
    .order("created_at", { ascending: false });

  const activity: ActivityEntry[] = (activityRaw ?? []).map((a) => ({
    id: a.id,
    action: a.action,
    metadata: (a.metadata as Record<string, unknown>) ?? {},
    createdAt: a.created_at,
    authorId: a.user_id,
    authorName: (a.profiles as unknown as { full_name: string } | null)?.full_name ?? "Sistema",
  }));

  return {
    ...mapCard(card as RawCardRow),
    checklists,
    comments,
    activity,
  };
}
