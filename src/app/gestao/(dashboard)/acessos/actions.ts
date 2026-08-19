"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import type { Database } from "@/types/database";

type AccessCredentialUpdate = Database["public"]["Tables"]["access_credentials"]["Update"];

async function requireUser() {
  const user = await getCurrentUser();
  if (!user?.organizationId) throw new Error("Organização não encontrada.");
  return user;
}

async function logActivity(organizationId: string, userId: string, entityId: string, action: string, metadata: Record<string, unknown> = {}) {
  const supabase = await createClient();
  await supabase.from("activities").insert({
    organization_id: organizationId,
    user_id: userId,
    entity_type: "acesso",
    entity_id: entityId,
    action,
    metadata,
  });
}

function revalidateAcessos() {
  revalidatePath("/gestao/acessos");
}

export async function createAccessCredential(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Preencha o nome.");

  const url = String(formData.get("url") ?? "").trim() || null;
  const login = String(formData.get("login") ?? "").trim() || null;
  const password = String(formData.get("password") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const { data, error } = await supabase
    .from("access_credentials")
    .insert({
      organization_id: user.organizationId!,
      name,
      url,
      login,
      password,
      notes,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error("Não foi possível registrar o acesso.");

  await logActivity(user.organizationId!, user.id, data.id, "adicionou um acesso", { name });
  revalidateAcessos();
}

export async function updateAccessCredential(id: string, patch: AccessCredentialUpdate) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("access_credentials")
    .update(patch)
    .eq("id", id)
    .eq("organization_id", user.organizationId!);
  if (error) throw new Error("Não foi possível salvar as alterações.");

  await logActivity(user.organizationId!, user.id, id, "editou um acesso");
  revalidateAcessos();
}

export async function deleteAccessCredential(id: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("access_credentials")
    .delete()
    .eq("id", id)
    .eq("organization_id", user.organizationId!);
  if (error) throw new Error("Não foi possível excluir o acesso.");

  await logActivity(user.organizationId!, user.id, id, "excluiu um acesso");
  revalidateAcessos();
}
