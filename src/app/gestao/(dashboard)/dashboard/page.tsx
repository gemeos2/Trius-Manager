import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getFinancialSummarySeries } from "@/lib/financeiro/queries";
import {
  getMonthOverMonthSummary,
  getRevenueByCategory,
  getRevenueBySegment,
  getTopClientsByRevenue,
} from "@/lib/dashboard/queries";
import { DashboardView, type DashboardData } from "@/components/dashboard/DashboardView";

async function getActiveCounts(organizationId: string) {
  const supabase = await createClient();

  const [clients, contracts] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "ativo"),
    supabase.from("contracts").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "ativo"),
  ]);

  return { activeClients: clients.count ?? 0, activeContracts: contracts.count ?? 0 };
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/gestao/login");

  const orgId = user.organizationId;

  const data: DashboardData = orgId
    ? await (async () => {
        const [counts, momSummary, series12, revenueByCategory, topClients, revenueBySegment] = await Promise.all([
          getActiveCounts(orgId),
          getMonthOverMonthSummary(orgId),
          getFinancialSummarySeries(orgId, 12),
          getRevenueByCategory(orgId),
          getTopClientsByRevenue(orgId),
          getRevenueBySegment(orgId),
        ]);
        return { ...counts, momSummary, series12, revenueByCategory, topClients, revenueBySegment };
      })()
    : {
        activeClients: 0,
        activeContracts: 0,
        momSummary: {
          current: { revenueTotal: 0, expenseTotal: 0, profit: 0, marginPct: 0 },
          previous: { revenueTotal: 0, expenseTotal: 0, profit: 0, marginPct: 0 },
        },
        series12: [],
        revenueByCategory: [],
        topClients: [],
        revenueBySegment: [],
      };

  const hasAnyData =
    data.activeClients > 0 ||
    data.momSummary.current.revenueTotal > 0 ||
    data.momSummary.current.expenseTotal > 0 ||
    data.series12.some((m) => m.revenue > 0 || m.expense > 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Olá, {user.fullName.split(" ")[0]}. Visão geral de {user.organizationName}.</p>
        </div>
      </div>

      <DashboardView data={data} hasAnyData={hasAnyData} />
    </>
  );
}
