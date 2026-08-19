"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";

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
    entity_type: "client",
    entity_id: entityId,
    action,
    metadata,
  });
}

function revalidateClient(clientId: string) {
  revalidatePath(`/gestao/clientes/${clientId}`);
}

// ---------- Contratos ----------

export async function linkContract(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const clientId = String(formData.get("client_id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!clientId || !title) throw new Error("Preencha os campos obrigatórios.");

  const valueRaw = String(formData.get("value") ?? "").trim();

  const { error } = await supabase.from("contracts").insert({
    organization_id: user.organizationId!,
    client_id: clientId,
    title,
    value: valueRaw ? Number(valueRaw) : null,
    is_recurring: formData.get("is_recurring") === "on",
    signed_at: String(formData.get("signed_at") ?? "") || null,
    renewal_at: String(formData.get("renewal_at") ?? "") || null,
  });

  if (error) throw new Error("Não foi possível criar o contrato.");

  await logActivity(user.organizationId!, user.id, clientId, "adicionou o contrato", { title });
  revalidateClient(clientId);
}

export async function deleteContract(clientId: string, contractId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("contracts").delete().eq("id", contractId).eq("organization_id", user.organizationId!);
  if (error) throw new Error("Não foi possível excluir o contrato.");

  await logActivity(user.organizationId!, user.id, clientId, "excluiu um contrato");
  revalidateClient(clientId);
}

// ---------- Financeiro ----------

export async function registerRevenueForClient(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const clientId = String(formData.get("client_id") ?? "");
  const description = String(formData.get("description") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  if (!clientId || !description || !amountRaw) throw new Error("Preencha os campos obrigatórios.");

  const { error } = await supabase.from("revenues").insert({
    organization_id: user.organizationId!,
    client_id: clientId,
    description,
    amount: Number(amountRaw),
    is_recurring: formData.get("is_recurring") === "on",
    due_date: String(formData.get("due_date") ?? "") || null,
  });

  if (error) throw new Error("Não foi possível registrar a receita.");

  await logActivity(user.organizationId!, user.id, clientId, "registrou uma receita", { description, amount: amountRaw });
  revalidateClient(clientId);
}
