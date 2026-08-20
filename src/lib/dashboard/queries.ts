import { createClient } from "@/lib/supabase/server";
import { getFinancialSummary } from "@/lib/financeiro/queries";
import type { FinancialSummary } from "@/lib/financeiro/types";

export interface MonthOverMonthSummary {
  current: FinancialSummary;
  previous: FinancialSummary;
}

export interface RankedItem {
  label: string;
  value: number;
}

function monthDate(offset: number) {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + offset, 1);
}

export async function getMonthOverMonthSummary(organizationId: string): Promise<MonthOverMonthSummary> {
  const [current, previous] = await Promise.all([
    getFinancialSummary(organizationId, monthDate(0)),
    getFinancialSummary(organizationId, monthDate(-1)),
  ]);
  return { current, previous };
}

export async function getRevenueByCategory(organizationId: string): Promise<RankedItem[]> {
  const supabase = await createClient();
  const period = monthDate(0);
  const start = new Date(period.getFullYear(), period.getMonth(), 1).toISOString().slice(0, 10);
  const end = new Date(period.getFullYear(), period.getMonth() + 1, 1).toISOString().slice(0, 10);

  const { data } = await supabase
    .from("revenues")
    .select("amount, category_id, categories(name)")
    .eq("organization_id", organizationId)
    .gte("issue_date", start)
    .lt("issue_date", end);

  const map = new Map<string, RankedItem>();
  for (const row of data ?? []) {
    const key = row.category_id ?? "__none__";
    const name = (row.categories as unknown as { name: string } | null)?.name ?? "Sem categoria";
    const existing = map.get(key);
    if (existing) existing.value += row.amount;
    else map.set(key, { label: name, value: row.amount });
  }

  return [...map.values()].sort((a, b) => b.value - a.value);
}

export async function getTopClientsByRevenue(organizationId: string, limit = 10): Promise<RankedItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("client_profitability")
    .select("client_id, revenue_total, clients(name)")
    .eq("organization_id", organizationId)
    .gt("revenue_total", 0)
    .order("revenue_total", { ascending: false })
    .limit(limit);

  return (data ?? []).map((row) => ({
    label: (row.clients as unknown as { name: string } | null)?.name ?? "Sem nome",
    value: row.revenue_total,
  }));
}

export async function getRevenueBySegment(organizationId: string): Promise<RankedItem[]> {
  const supabase = await createClient();

  const [{ data: clients }, { data: profitability }] = await Promise.all([
    supabase
      .from("clients")
      .select("id, segment_id, client_segments(name)")
      .eq("organization_id", organizationId),
    supabase
      .from("client_profitability")
      .select("client_id, revenue_total")
      .eq("organization_id", organizationId),
  ]);

  const revenueByClient = new Map((profitability ?? []).map((p) => [p.client_id, p.revenue_total]));

  const map = new Map<string, RankedItem>();
  for (const client of clients ?? []) {
    const revenue = revenueByClient.get(client.id) ?? 0;
    if (revenue <= 0) continue;
    const key = client.segment_id ?? "__none__";
    const name = (client.client_segments as unknown as { name: string } | null)?.name ?? "Sem nicho";
    const existing = map.get(key);
    if (existing) existing.value += revenue;
    else map.set(key, { label: name, value: revenue });
  }

  return [...map.values()].sort((a, b) => b.value - a.value);
}
