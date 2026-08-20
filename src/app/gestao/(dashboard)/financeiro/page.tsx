import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { createClient } from "@/lib/supabase/server";
import { getCategories, getFinancialSummary, getTransactions, type TransactionSortKey } from "@/lib/financeiro/queries";
import { FinanceiroView } from "@/components/financeiro/FinanceiroView";
import { parsePeriod } from "@/lib/financeiro/period";
import type { CategorySummary, FinancialSummary, TransactionKind, TransactionSummary } from "@/lib/financeiro/types";

interface ClientOption {
  id: string;
  name: string;
}

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

  const period = parsePeriod(params.period ?? null);
  const kind = params.kind === "receita" || params.kind === "despesa" ? (params.kind as TransactionKind) : undefined;
  const sortBy = params.sort === "amount" ? "amount" : ("date" as TransactionSortKey);
  const sortDir = params.dir === "asc" ? "asc" : "desc";

  const orgId = user.organizationId;
  const [summary, transactions, categories, clients, anyTransactionEver]: [
    FinancialSummary,
    TransactionSummary[],
    CategorySummary[],
    ClientOption[],
    TransactionSummary[],
  ] = orgId
    ? await Promise.all([
        getFinancialSummary(orgId, period),
        getTransactions(orgId, { kind, categoryId: params.category, clientId: params.client, period, sortBy, sortDir }),
        getCategories(orgId),
        getClientOptions(orgId),
        getTransactions(orgId, { period: "all" }),
      ])
    : [{ revenueTotal: 0, expenseTotal: 0, profit: 0, marginPct: 0 }, [], [], [], []];

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
