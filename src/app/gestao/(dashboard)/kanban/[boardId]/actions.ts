"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getCardDetail, getOrgLabels, getOrgMembers } from "@/lib/kanban/queries";
import type { CardPriority } from "@/types/database";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user?.organizationId) throw new Error("Organização não encontrada.");
  return user;
}

async function logActivity(
  organizationId: string,
  userId: string,
  entityType: string,
  entityId: string,
  action: string,
  metadata: Record<string, unknown> = {}
) {
  const supabase = await createClient();
  await supabase.from("activities").insert({
    organization_id: organizationId,
    user_id: userId,
    entity_type: entityType,
    entity_id: entityId,
    action,
    metadata,
  });
}

function revalidateBoard(boardId: string) {
  revalidatePath(`/gestao/kanban/${boardId}`);
}

// ---------- Leitura (modal de detalhe) ----------

export async function getCardModalData(cardId: string) {
  const user = await requireUser();
  const [card, members, labels] = await Promise.all([
    getCardDetail(cardId),
    getOrgMembers(user.organizationId!),
    getOrgLabels(user.organizationId!),
  ]);
  return { card, members, labels };
}

// ---------- Listas ----------

export async function createList(boardId: string, name: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { count } = await supabase
    .from("board_lists")
    .select("id", { count: "exact", head: true })
    .eq("board_id", boardId);

  const { data, error } = await supabase
    .from("board_lists")
    .insert({ board_id: boardId, name, position: count ?? 0 })
    .select("id")
    .single();
  if (error || !data) throw new Error("Não foi possível criar a lista.");

  await logActivity(user.organizationId!, user.id, "board", boardId, "criou a lista", { name });
  revalidateBoard(boardId);
  return data.id;
}

export async function renameList(boardId: string, listId: string, name: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("board_lists").update({ name }).eq("id", listId);
  if (error) throw new Error("Não foi possível renomear a lista.");
  revalidateBoard(boardId);
}

export async function archiveList(boardId: string, listId: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("board_lists")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", listId);
  if (error) throw new Error("Não foi possível arquivar a lista.");
  revalidateBoard(boardId);
}

export async function deleteList(boardId: string, listId: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("board_lists").delete().eq("id", listId);
  if (error) throw new Error("Não foi possível excluir a lista.");
  revalidateBoard(boardId);
}

export async function reorderLists(boardId: string, orderedListIds: string[]) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("reorder_lists", { p_board_id: boardId, p_ordered_ids: orderedListIds });
  if (error) throw new Error("Não foi possível reordenar as listas.");
  revalidateBoard(boardId);
}

// ---------- Cards ----------

export async function createCard(boardId: string, listId: string, title: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { count } = await supabase
    .from("board_cards")
    .select("id", { count: "exact", head: true })
    .eq("list_id", listId);

  const { data, error } = await supabase
    .from("board_cards")
    .insert({ list_id: listId, title, position: count ?? 0 })
    .select("id")
    .single();

  if (error || !data) throw new Error("Não foi possível criar o card.");

  await logActivity(user.organizationId!, user.id, "board_card", data.id, "criou o card", { title });
  revalidateBoard(boardId);
  return data.id;
}

export interface CardPatch {
  title?: string;
  description?: string | null;
  status?: string;
  priority?: CardPriority;
  start_date?: string | null;
  due_date?: string | null;
  client_id?: string | null;
  project_id?: string | null;
  cover_color?: string | null;
}

export async function updateCard(boardId: string, cardId: string, patch: CardPatch) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("board_cards")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", cardId);

  if (error) throw new Error("Não foi possível atualizar o card.");

  const fields = Object.keys(patch).join(", ");
  await logActivity(user.organizationId!, user.id, "board_card", cardId, "atualizou " + fields, { ...patch });
  revalidateBoard(boardId);
}

export async function archiveCard(boardId: string, cardId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase
    .from("board_cards")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", cardId);
  if (error) throw new Error("Não foi possível arquivar o card.");
  await logActivity(user.organizationId!, user.id, "board_card", cardId, "arquivou o card");
  revalidateBoard(boardId);
}

export async function deleteCard(boardId: string, cardId: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("board_cards").delete().eq("id", cardId);
  if (error) throw new Error("Não foi possível excluir o card.");
  revalidateBoard(boardId);
}

export async function reorderCards(boardId: string, listId: string, orderedCardIds: string[]) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("reorder_cards", { p_list_id: listId, p_ordered_ids: orderedCardIds });
  if (error) throw new Error("Não foi possível reordenar os cards.");
  revalidateBoard(boardId);
}

export async function moveCard(boardId: string, cardId: string, targetListId: string, targetPosition: number) {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.rpc("move_card", {
    p_card_id: cardId,
    p_target_list_id: targetListId,
    p_target_position: targetPosition,
  });
  if (error) throw new Error("Não foi possível mover o card.");
  await logActivity(user.organizationId!, user.id, "board_card", cardId, "moveu o card");
  revalidateBoard(boardId);
}

// ---------- Membros ----------

export async function addCardMember(boardId: string, cardId: string, userId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("card_members").insert({ card_id: cardId, user_id: userId });
  if (error) throw new Error("Não foi possível adicionar o membro.");
  await logActivity(user.organizationId!, user.id, "board_card", cardId, "adicionou um membro");
  revalidateBoard(boardId);
}

export async function removeCardMember(boardId: string, cardId: string, userId: string) {
  const user = await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("card_members").delete().eq("card_id", cardId).eq("user_id", userId);
  if (error) throw new Error("Não foi possível remover o membro.");
  await logActivity(user.organizationId!, user.id, "board_card", cardId, "removeu um membro");
  revalidateBoard(boardId);
}

// ---------- Labels ----------

export async function createLabel(boardId: string, name: string, colorToken: string) {
  const user = await requireUser();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("labels")
    .insert({ organization_id: user.organizationId!, name, color_token: colorToken })
    .select("id")
    .single();
  if (error || !data) throw new Error("Não foi possível criar a label.");
  revalidateBoard(boardId);
  return data.id;
}

export async function applyLabel(boardId: string, cardId: string, labelId: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("card_labels").insert({ card_id: cardId, label_id: labelId });
  if (error) throw new Error("Não foi possível aplicar a label.");
  revalidateBoard(boardId);
}

export async function removeLabel(boardId: string, cardId: string, labelId: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("card_labels").delete().eq("card_id", cardId).eq("label_id", labelId);
  if (error) throw new Error("Não foi possível remover a label.");
  revalidateBoard(boardId);
}

// ---------- Checklists ----------

export async function createChecklist(boardId: string, cardId: string, title: string) {
  await requireUser();
  const supabase = await createClient();

  const { count } = await supabase
    .from("checklists")
    .select("id", { count: "exact", head: true })
    .eq("card_id", cardId);

  const { error } = await supabase.from("checklists").insert({ card_id: cardId, title, position: count ?? 0 });
  if (error) throw new Error("Não foi possível criar o checklist.");
  revalidateBoard(boardId);
}

export async function deleteChecklist(boardId: string, checklistId: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("checklists").delete().eq("id", checklistId);
  if (error) throw new Error("Não foi possível excluir o checklist.");
  revalidateBoard(boardId);
}

export async function addChecklistItem(boardId: string, checklistId: string, title: string) {
  await requireUser();
  const supabase = await createClient();

  const { count } = await supabase
    .from("checklist_items")
    .select("id", { count: "exact", head: true })
    .eq("checklist_id", checklistId);

  const { error } = await supabase
    .from("checklist_items")
    .insert({ checklist_id: checklistId, title, position: count ?? 0 });
  if (error) throw new Error("Não foi possível adicionar o item.");
  revalidateBoard(boardId);
}

export async function toggleChecklistItem(boardId: string, itemId: string, done: boolean) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("checklist_items").update({ done }).eq("id", itemId);
  if (error) throw new Error("Não foi possível atualizar o item.");
  revalidateBoard(boardId);
}

export async function deleteChecklistItem(boardId: string, itemId: string) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from("checklist_items").delete().eq("id", itemId);
  if (error) throw new Error("Não foi possível excluir o item.");
  revalidateBoard(boardId);
}

// ---------- Comentários ----------

export async function postComment(boardId: string, cardId: string, body: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("card_comments")
    .insert({ card_id: cardId, user_id: user.id, body })
    .select("id")
    .single();

  if (error || !data) throw new Error("Não foi possível postar o comentário.");

  await logActivity(user.organizationId!, user.id, "board_card", cardId, "comentou", { comment_id: data.id });
  revalidateBoard(boardId);
}
