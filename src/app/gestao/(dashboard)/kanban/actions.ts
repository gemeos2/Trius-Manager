"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";

export interface BoardFormState {
  error?: string;
}

export async function createBoard(_prevState: BoardFormState, formData: FormData): Promise<BoardFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) {
    return { error: "Dê um nome ao board." };
  }

  const user = await getCurrentUser();
  if (!user?.organizationId) {
    return { error: "Organização não encontrada." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .insert({ organization_id: user.organizationId, name, description: description || null })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Não foi possível criar o board. Tente novamente." };
  }

  await supabase.from("activities").insert({
    organization_id: user.organizationId,
    user_id: user.id,
    entity_type: "board",
    entity_id: data.id,
    action: "criou o board",
    metadata: { name },
  });

  redirect(`/gestao/kanban/${data.id}`);
}

export async function archiveBoard(boardId: string) {
  const user = await getCurrentUser();
  if (!user?.organizationId) throw new Error("Organização não encontrada.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("boards")
    .update({ archived_at: new Date().toISOString() })
    .eq("id", boardId)
    .eq("organization_id", user.organizationId);

  if (error) throw new Error("Não foi possível arquivar o board.");

  revalidatePath("/gestao/kanban");
}

export async function duplicateBoard(boardId: string) {
  const user = await getCurrentUser();
  if (!user?.organizationId) throw new Error("Organização não encontrada.");

  const supabase = await createClient();

  const { data: original } = await supabase.from("boards").select("name").eq("id", boardId).single();
  if (!original) throw new Error("Board não encontrado.");

  const { data: newId, error } = await supabase.rpc("duplicate_board", {
    p_board_id: boardId,
    p_new_name: `${original.name} (cópia)`,
  });

  if (error || !newId) throw new Error("Não foi possível duplicar o board.");

  await supabase.from("activities").insert({
    organization_id: user.organizationId,
    user_id: user.id,
    entity_type: "board",
    entity_id: newId,
    action: "duplicou o board",
    metadata: { source_board_id: boardId },
  });

  revalidatePath("/gestao/kanban");
  return newId;
}

export async function deleteBoard(boardId: string) {
  const user = await getCurrentUser();
  if (!user?.organizationId) throw new Error("Organização não encontrada.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("boards")
    .delete()
    .eq("id", boardId)
    .eq("organization_id", user.organizationId);

  if (error) throw new Error("Não foi possível excluir o board.");

  revalidatePath("/gestao/kanban");
}
