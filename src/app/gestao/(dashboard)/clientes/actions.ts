"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import type { ClientStatus } from "@/types/database";

async function requireUser() {
  const user = await getCurrentUser();
  if (!user?.organizationId) throw new Error("Organização não encontrada.");
  return user;
}

export interface ClientFormState {
  error?: string;
}

export async function createClientAction(_prevState: ClientFormState, formData: FormData): Promise<ClientFormState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Informe o nome do cliente." };

  const user = await requireUser();
  const supabase = await createClient();

  const monthlyValueRaw = String(formData.get("monthly_value") ?? "").trim();

  const segmentId = String(formData.get("segment_id") ?? "").trim();

  const { data, error } = await supabase
    .from("clients")
    .insert({
      organization_id: user.organizationId!,
      name,
      company: String(formData.get("company") ?? "").trim() || null,
      email: String(formData.get("email") ?? "").trim() || null,
      phone: String(formData.get("phone") ?? "").trim() || null,
      whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
      document_id: String(formData.get("document_id") ?? "").trim() || null,
      status: (String(formData.get("status") ?? "lead") as ClientStatus) || "lead",
      monthly_value: monthlyValueRaw ? Number(monthlyValueRaw) : null,
      notes: String(formData.get("notes") ?? "").trim() || null,
      segment_id: segmentId || null,
    })
    .select("id")
    .single();

  if (error || !data) return { error: "Não foi possível criar o cliente. Tente novamente." };

  await supabase.from("activities").insert({
    organization_id: user.organizationId!,
    user_id: user.id,
    entity_type: "client",
    entity_id: data.id,
    action: "criou o cliente",
    metadata: { name },
  });

  revalidatePath("/gestao/clientes");
  redirect(`/gestao/clientes/${data.id}`);
}

export interface ClientPatch {
  name?: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  document_id?: string | null;
  status?: ClientStatus;
  monthly_value?: number | null;
  notes?: string | null;
  responsible_user_id?: string | null;
  segment_id?: string | null;
}

export async function updateClientAction(clientId: string, patch: ClientPatch) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("clients")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", clientId)
    .eq("organization_id", user.organizationId!);

  if (error) throw new Error("Não foi possível atualizar o cliente.");

  const fields = Object.keys(patch).join(", ");
  await supabase.from("activities").insert({
    organization_id: user.organizationId!,
    user_id: user.id,
    entity_type: "client",
    entity_id: clientId,
    action: "atualizou " + fields,
    metadata: { ...patch },
  });

  revalidatePath("/gestao/clientes");
  revalidatePath(`/gestao/clientes/${clientId}`);
}

export async function deleteClientAction(clientId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("clients").delete().eq("id", clientId).eq("organization_id", user.organizationId!);
  if (error) throw new Error("Não foi possível excluir o cliente.");

  revalidatePath("/gestao/clientes");
}

export async function createClientSegmentAction(name: string): Promise<{ id: string; name: string }> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Informe o nome do nicho.");

  const user = await requireUser();
  const supabase = await createClient();

  const { data: inserted } = await supabase
    .from("client_segments")
    .insert({ organization_id: user.organizationId!, name: trimmed })
    .select("id, name")
    .single();

  if (inserted) {
    revalidatePath("/gestao/clientes");
    return inserted;
  }

  // Provavelmente conflito de unique(organization_id, name) — o nicho já
  // existe nesta organização, então reusa em vez de falhar.
  const { data: existing, error: existingError } = await supabase
    .from("client_segments")
    .select("id, name")
    .eq("organization_id", user.organizationId!)
    .eq("name", trimmed)
    .single();

  if (existingError || !existing) throw new Error("Não foi possível criar o nicho.");

  return existing;
}
