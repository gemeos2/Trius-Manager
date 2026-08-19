import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getCategories, getFinancialSummary, getTransactions, type TransactionSortKey } from "@/lib/financeiro/queries";
import { FinanceiroView } from "@/components/financeiro/FinanceiroView";
import { parsePeriod } from "@/lib/financeiro/period";
import type { TransactionKind } from "@/lib/financeiro/types";

export const metadata: Metadata = { title: "Financeiro — TRIUS" };

async function getClientOptions(organizationId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("id, name").eq("organization_id", organizationId).order("name");
  return data ?? [];
}

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; period?: string; kind?: string; category?: string; client?: string; sort?: string; dir?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/gestao/login");
  if (!user.organizationId) redirect("/gestao/configuracoes");

  const period = parsePeriod(params.period ?? null);
  const kind = params.kind === "receita" || params.kind === "despesa" ? (params.kind as TransactionKind) : undefined;
  const sortBy = params.sort === "amount" ? "amount" : ("date" as TransactionSortKey);
  const sortDir = params.dir === "asc" ? "asc" : "desc";

  const [summary, transactions, categories, clients, anyTransactionEver] = await Promise.all([
    getFinancialSummary(user.organizationId, period),
    getTransactions(user.organizationId, { kind, categoryId: params.category, clientId: params.client, period, sortBy, sortDir }),
    getCategories(user.organizationId),
    getClientOptions(user.organizationId),
    getTransactions(user.organizationId, { period: "all" }),
  ]);

  const hasAnyTransaction = anyTransactionEver.length > 0;

  return (
    <FinanceiroView
      summary={summary}
      transactions={transactions}
      categories={categories}
      clients={clients}
      hasAnyTransaction={hasAnyTransaction}
    />
  );
}
