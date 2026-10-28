import { createClient } from "@/lib/supabase/server";
import type { CategorySummary, FinancialSummary, MonthlyFinancialPoint, TransactionKind, TransactionSummary } from "./types";

export type TransactionSortKey = "date" | "amount";

export interface GetTransactionsOptions {
  kind?: TransactionKind;
  categoryId?: string;
  clientId?: string;
  period?: Date | "all";
  sortBy?: TransactionSortKey;
  sortDir?: "asc" | "desc";
}

function monthRange(period: Date) {
  const start = new Date(period.getFullYear(), period.getMonth(), 1);
  const end = new Date(period.getFullYear(), period.getMonth() + 1, 1);
  const toISODate = (d: Date) => d.toISOString().slice(0, 10);
  return { start: toISODate(start), end: toISODate(end) };
}

export async function getTransactions(organizationId: string, options: GetTransactionsOptions = {}): Promise<TransactionSummary[]> {
  const supabase = await createClient();

  let revenuesQuery = supabase
    .from("revenues")
    .select("id, description, amount, status, is_recurring, issue_date, client_id, category_id, clients(name), categories(name)")
    .eq("organization_id", organizationId);

  let expensesQuery = supabase
    .from("expenses")
    .select("id, description, amount, is_recurring, installments_total, installments_paid, expense_date, client_id, category_id, clients(name), categories(name)")
    .eq("organization_id", organizationId);

  if (options.categoryId) {
    revenuesQuery = revenuesQuery.eq("category_id", options.categoryId);
    expensesQuery = expensesQuery.eq("category_id", options.categoryId);
  }
  if (options.clientId) {
    revenuesQuery = revenuesQuery.eq("client_id", options.clientId);
    expensesQuery = expensesQuery.eq("client_id", options.clientId);
  }

  // Lançamentos recorrentes "existem" em todo mês a partir da data original,
  // então o filtro de período não pode excluí-los pela data literal — isso é
  // resolvido depois, projetando a data para dentro do período consultado.
  if (options.period && options.period !== "all") {
    const { start, end } = monthRange(options.period);
    revenuesQuery = revenuesQuery.or(`is_recurring.eq.true,and(issue_date.gte.${start},issue_date.lt.${end})`);
    expensesQuery = expensesQuery.or(`is_recurring.eq.true,and(expense_date.gte.${start},expense_date.lt.${end})`);
  }

  // O valor mensal de clientes ativos já entra no resumo financeiro; aqui ele
  // vira uma linha "Mensalidade" para aparecer também na lista. Não tem
  // categoria, então some quando há filtro por categoria.
  let monthlyFeesQuery = supabase
    .from("clients")
    .select("id, name, monthly_value, entry_date")
    .eq("organization_id", organizationId)
    .eq("status", "ativo")
    .gt("monthly_value", 0);
  if (options.clientId) {
    monthlyFeesQuery = monthlyFeesQuery.eq("id", options.clientId);
  }

  const fetchRevenues = options.kind === "despesa" ? Promise.resolve({ data: [] as never[] }) : revenuesQuery;
  const fetchExpenses = options.kind === "receita" ? Promise.resolve({ data: [] as never[] }) : expensesQuery;
  const fetchMonthlyFees =
    options.kind === "despesa" || options.categoryId ? Promise.resolve({ data: [] as never[] }) : monthlyFeesQuery;

  const [{ data: revenuesRaw }, { data: expensesRaw }, { data: monthlyFeesRaw }] = await Promise.all([
    fetchRevenues,
    fetchExpenses,
    fetchMonthlyFees,
  ]);

  const periodFilter = options.period && options.period !== "all" ? monthRange(options.period) : null;

  // Recorrentes só contam a partir do mês em que foram criadas (não retroage)
  // e têm a data exibida projetada para o 1º dia do mês consultado.
  const revenues = periodFilter
    ? (revenuesRaw ?? [])
        .filter((r) => !r.is_recurring || r.issue_date < periodFilter.end)
        .map((r) => (r.is_recurring ? { ...r, issue_date: periodFilter.start } : r))
    : revenuesRaw ?? [];

  const expenses = periodFilter
    ? (expensesRaw ?? [])
        .filter((e) => !e.is_recurring || e.expense_date < periodFilter.end)
        .map((e) => (e.is_recurring ? { ...e, expense_date: periodFilter.start } : e))
    : expensesRaw ?? [];

  const revenueRows: TransactionSummary[] = (revenues ?? []).map((r) => ({
    id: r.id,
    kind: "receita",
    description: r.description,
    amount: r.amount,
    date: r.issue_date,
    categoryId: r.category_id,
    categoryName: (r.categories as unknown as { name: string } | null)?.name ?? null,
    clientId: r.client_id,
    clientName: (r.clients as unknown as { name: string } | null)?.name ?? null,
    status: r.status,
    isRecurring: r.is_recurring,
    installmentsTotal: null,
    installmentsPaid: 0,
  }));

  const expenseRows: TransactionSummary[] = (expenses ?? []).map((e) => ({
    id: e.id,
    kind: "despesa",
    description: e.description,
    amount: e.amount,
    date: e.expense_date,
    categoryId: e.category_id,
    categoryName: (e.categories as unknown as { name: string } | null)?.name ?? null,
    clientId: e.client_id,
    clientName: (e.clients as unknown as { name: string } | null)?.name ?? null,
    status: null,
    isRecurring: e.is_recurring,
    installmentsTotal: e.installments_total,
    installmentsPaid: e.installments_paid,
  }));

  const monthlyFeeRows: TransactionSummary[] = (monthlyFeesRaw ?? []).map((c) => ({
    id: `mensalidade-${c.id}`,
    kind: "receita",
    description: "Mensalidade",
    amount: c.monthly_value ?? 0,
    date: periodFilter ? periodFilter.start : c.entry_date,
    categoryId: null,
    categoryName: null,
    clientId: c.id,
    clientName: c.name,
    status: null,
    isRecurring: true,
    installmentsTotal: null,
    installmentsPaid: 0,
    isMonthlyFee: true,
  }));

  const rows = [...revenueRows, ...expenseRows, ...monthlyFeeRows];

  const sortBy = options.sortBy ?? "date";
  const dir = options.sortDir === "asc" ? 1 : -1;

  rows.sort((a, b) => {
    if (sortBy === "amount") return (a.amount - b.amount) * dir;
    return a.date.localeCompare(b.date) * dir;
  });

  return rows;
}

export async function getCategories(organizationId: string): Promise<CategorySummary[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("categories")
    .select("id, name, type")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  return (data ?? []).map((c) => ({ id: c.id, name: c.name, type: c.type }));
}

async function getActiveClientsMonthlyTotal(organizationId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase.from("clients").select("monthly_value").eq("organization_id", organizationId).eq("status", "ativo");
  return (data ?? []).reduce((sum, c) => sum + (c.monthly_value ?? 0), 0);
}

export async function getFinancialSummary(organizationId: string, period: Date | "all"): Promise<FinancialSummary> {
  const supabase = await createClient();

  let query = supabase.from("financial_summary").select("period, kind, total").eq("organization_id", organizationId);

  if (period !== "all") {
    const periodDate = new Date(period.getFullYear(), period.getMonth(), 1).toISOString().slice(0, 10);
    query = query.eq("period", periodDate);
  }

  const [{ data }, monthlyValueTotal] = await Promise.all([
    query,
    period === "all" ? Promise.resolve(0) : getActiveClientsMonthlyTotal(organizationId),
  ]);

  let revenueTotal = monthlyValueTotal;
  let expenseTotal = 0;
  for (const row of data ?? []) {
    if (row.kind === "receita") revenueTotal += row.total;
    else expenseTotal += row.total;
  }

  const profit = revenueTotal - expenseTotal;
  const marginPct = revenueTotal === 0 ? 0 : Math.round((profit / revenueTotal) * 10000) / 100;

  return { revenueTotal, expenseTotal, profit, marginPct };
}

export async function getFinancialSummarySeries(organizationId: string, months = 12): Promise<MonthlyFinancialPoint[]> {
  const supabase = await createClient();

  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);
  const startISO = start.toISOString().slice(0, 10);

  const { data } = await supabase
    .from("financial_summary")
    .select("period, kind, total")
    .eq("organization_id", organizationId)
    .gte("period", startISO);

  const points: MonthlyFinancialPoint[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    points.push({ period: d.toISOString().slice(0, 10), revenue: 0, expense: 0 });
  }
  const byPeriod = new Map(points.map((p) => [p.period, p]));

  for (const row of data ?? []) {
    const point = byPeriod.get(row.period);
    if (!point) continue;
    if (row.kind === "receita") point.revenue += row.total;
    else point.expense += row.total;
  }

  return points;
}
