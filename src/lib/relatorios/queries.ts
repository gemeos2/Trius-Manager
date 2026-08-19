import { createClient } from "@/lib/supabase/server";
import type { ClientStatus } from "@/types/database";
import type { CategoryBreakdownItem, ReportData, ReportRange, TopClientItem } from "./types";

const CHURNED_CLIENT_STATUSES: ClientStatus[] = ["cancelado", "inadimplente"];
const ENDED_CONTRACT_STATUSES = ["encerrado", "cancelado"];

export async function getReportData(organizationId: string, range: ReportRange): Promise<ReportData> {
  const supabase = await createClient();

  const [
    revenuesRes,
    expensesRes,
    newClientsRes,
    activeClientsRes,
    churnedClientsRes,
    contractsSignedRes,
    activeContractsRes,
    endedContractsRes,
  ] = await Promise.all([
    supabase
      .from("revenues")
      .select("amount, client_id, category_id, clients(name), categories(name)")
      .eq("organization_id", organizationId)
      .gte("issue_date", range.start)
      .lt("issue_date", range.end),
    supabase
      .from("expenses")
      .select("amount, category_id, categories(name)")
      .eq("organization_id", organizationId)
      .gte("expense_date", range.start)
      .lt("expense_date", range.end),
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .gte("entry_date", range.start)
      .lt("entry_date", range.end),
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "ativo"),
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .in("status", CHURNED_CLIENT_STATUSES),
    supabase
      .from("contracts")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .gte("signed_at", range.start)
      .lt("signed_at", range.end),
    supabase
      .from("contracts")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .eq("status", "ativo"),
    supabase
      .from("contracts")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", organizationId)
      .in("status", ENDED_CONTRACT_STATUSES),
  ]);

  const revenues = revenuesRes.data ?? [];
  const expenses = expensesRes.data ?? [];

  const revenueTotal = revenues.reduce((sum, r) => sum + r.amount, 0);
  const expenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const profit = revenueTotal - expenseTotal;
  const marginPct = revenueTotal === 0 ? 0 : Math.round((profit / revenueTotal) * 10000) / 100;
  const averageTicket = revenues.length === 0 ? 0 : revenueTotal / revenues.length;

  const revenueByCategory = groupByCategory(
    revenues.map((r) => ({ categoryId: r.category_id, categoryName: (r.categories as unknown as { name: string } | null)?.name ?? null, amount: r.amount }))
  );
  const expenseByCategory = groupByCategory(
    expenses.map((e) => ({ categoryId: e.category_id, categoryName: (e.categories as unknown as { name: string } | null)?.name ?? null, amount: e.amount }))
  );

  const topClients = groupByClient(
    revenues.map((r) => ({ clientId: r.client_id, clientName: (r.clients as unknown as { name: string } | null)?.name ?? null, amount: r.amount }))
  );

  return {
    range,
    revenueTotal,
    expenseTotal,
    profit,
    marginPct,
    newClients: newClientsRes.count ?? 0,
    activeClients: activeClientsRes.count ?? 0,
    churnedClients: churnedClientsRes.count ?? 0,
    contractsSignedInPeriod: contractsSignedRes.count ?? 0,
    activeContracts: activeContractsRes.count ?? 0,
    endedContracts: endedContractsRes.count ?? 0,
    averageTicket,
    revenueByCategory,
    expenseByCategory,
    topClients,
  };
}

function groupByCategory(rows: { categoryId: string | null; categoryName: string | null; amount: number }[]): CategoryBreakdownItem[] {
  const map = new Map<string, CategoryBreakdownItem>();
  for (const row of rows) {
    const key = row.categoryId ?? "__none__";
    const existing = map.get(key);
    if (existing) {
      existing.total += row.amount;
    } else {
      map.set(key, { categoryId: row.categoryId, categoryName: row.categoryName ?? "Sem categoria", total: row.amount });
    }
  }
  return [...map.values()].sort((a, b) => b.total - a.total);
}

function groupByClient(rows: { clientId: string | null; clientName: string | null; amount: number }[]): TopClientItem[] {
  const map = new Map<string, TopClientItem>();
  for (const row of rows) {
    if (!row.clientId) continue;
    const existing = map.get(row.clientId);
    if (existing) {
      existing.revenueTotal += row.amount;
    } else {
      map.set(row.clientId, { clientId: row.clientId, clientName: row.clientName ?? "Sem nome", revenueTotal: row.amount });
    }
  }
  return [...map.values()].sort((a, b) => b.revenueTotal - a.revenueTotal).slice(0, 10);
}
