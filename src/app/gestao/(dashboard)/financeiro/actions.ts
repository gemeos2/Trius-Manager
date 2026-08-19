"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import type { TransactionKind } from "@/lib/financeiro/types";
import type { Database } from "@/types/database";

type RevenueUpdate = Database["public"]["Tables"]["revenues"]["Update"];
type ExpenseUpdate = Database["public"]["Tables"]["expenses"]["Update"];

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
    entity_type: "financeiro",
    entity_id: entityId,
    action,
    metadata,
  });
}

function revalidateFinanceiro() {
  revalidatePath("/gestao/financeiro");
  revalidatePath("/gestao/dashboard");
}

// ---------- Lançamentos ----------

export async function createTransaction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const kind = String(formData.get("kind") ?? "") as TransactionKind;
  const description = String(formData.get("description") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  if (!description || !amountRaw) throw new Error("Preencha os campos obrigatórios.");

  const categoryId = String(formData.get("category_id") ?? "") || null;
  const clientId = String(formData.get("client_id") ?? "") || null;
  const isRecurring = formData.get("is_recurring") === "on";
  const isInstallment = formData.get("is_installment") === "on";
  const installmentsTotalRaw = String(formData.get("installments_total") ?? "").trim();
  const amount = Number(amountRaw);

  if (kind === "receita") {
    const { data, error } = await supabase
      .from("revenues")
      .insert({
        organization_id: user.organizationId!,
        description,
        amount,
        category_id: categoryId,
        client_id: clientId,
        is_recurring: isRecurring,
        issue_date: String(formData.get("date") ?? "") || undefined,
        due_date: String(formData.get("due_date") ?? "") || null,
      })
      .select("id")
      .single();
    if (error || !data) throw new Error("Não foi possível registrar a receita.");
    await logActivity(user.organizationId!, user.id, data.id, "registrou uma receita", { description, amount: amountRaw });
  } else {
    const { data, error } = await supabase
      .from("expenses")
      .insert({
        organization_id: user.organizationId!,
        description,
        amount,
        category_id: categoryId,
        client_id: clientId,
        is_recurring: isRecurring,
        installments_total: isInstallment && installmentsTotalRaw ? Number(installmentsTotalRaw) : null,
        expense_date: String(formData.get("date") ?? "") || undefined,
        due_date: String(formData.get("due_date") ?? "") || null,
      })
      .select("id")
      .single();
    if (error || !data) throw new Error("Não foi possível registrar a despesa.");
    await logActivity(user.organizationId!, user.id, data.id, "registrou uma despesa", { description, amount: amountRaw });
  }

  revalidateFinanceiro();
}

export async function updateRevenue(id: string, patch: RevenueUpdate) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("revenues").update(patch).eq("id", id).eq("organization_id", user.organizationId!);
  if (error) throw new Error("Não foi possível salvar as alterações.");

  await logActivity(user.organizationId!, user.id, id, "editou uma receita");
  revalidateFinanceiro();
}

export async function updateExpense(id: string, patch: ExpenseUpdate) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("expenses").update(patch).eq("id", id).eq("organization_id", user.organizationId!);
  if (error) throw new Error("Não foi possível salvar as alterações.");

  await logActivity(user.organizationId!, user.id, id, "editou uma despesa");
  revalidateFinanceiro();
}

export async function deleteTransaction(kind: TransactionKind, id: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const table = kind === "receita" ? "revenues" : "expenses";
  const { error } = await supabase.from(table).delete().eq("id", id).eq("organization_id", user.organizationId!);
  if (error) throw new Error("Não foi possível excluir o lançamento.");

  await logActivity(user.organizationId!, user.id, id, kind === "receita" ? "excluiu uma receita" : "excluiu uma despesa");
  revalidateFinanceiro();
}

// ---------- Categorias ----------

export async function createCategory(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  if (!name || (type !== "receita" && type !== "despesa")) throw new Error("Preencha os campos obrigatórios.");

  const { error } = await supabase.from("categories").insert({ organization_id: user.organizationId!, name, type });
  if (error) throw new Error("Não foi possível criar a categoria.");

  revalidateFinanceiro();
}

export async function renameCategory(id: string, name: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Informe um nome.");

  const { error } = await supabase.from("categories").update({ name: trimmed }).eq("id", id).eq("organization_id", user.organizationId!);
  if (error) throw new Error("Não foi possível renomear a categoria.");

  revalidateFinanceiro();
}

export async function deleteCategory(id: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("categories").delete().eq("id", id).eq("organization_id", user.organizationId!);
  if (error) throw new Error("Não foi possível excluir a categoria.");

  revalidateFinanceiro();
}
