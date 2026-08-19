import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getFinancialSummary } from "@/lib/financeiro/queries";
import { StatCard } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

async function getDashboardCounts(organizationId: string) {
  const supabase = await createClient();

  const [clients, contracts, financial] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "ativo"),
    supabase.from("contracts").select("id", { count: "exact", head: true }).eq("organization_id", organizationId).eq("status", "ativo"),
    getFinancialSummary(organizationId, new Date()),
  ]);

  return {
    activeClients: clients.count ?? 0,
    activeContracts: contracts.count ?? 0,
    revenueTotal: financial.revenueTotal,
    expenseTotal: financial.expenseTotal,
    profit: financial.profit,
  };
}

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/gestao/login");
  if (!user.organizationId) redirect("/gestao/configuracoes");

  const counts = await getDashboardCounts(user.organizationId);
  const hasAnyData = counts.activeClients > 0 || counts.revenueTotal > 0 || counts.expenseTotal > 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Olá, {user.fullName.split(" ")[0]}. Visão geral de {user.organizationName}.</p>
        </div>
      </div>

      {!hasAnyData ? (
        <div className="ds-card">
          <EmptyState
            title="Nenhum dado ainda"
            description="Cadastre clientes, receitas e despesas para ver os indicadores da empresa aqui. Este painel é calculado a partir dos dados reais do sistema — nada é mostrado até existir algo para medir."
          />
        </div>
      ) : (
        <div className="flex" style={{ gap: "1.25rem", flexWrap: "wrap" }}>
          <StatCard value={formatBRL(counts.revenueTotal)} label="Receita do mês" />
          <StatCard value={formatBRL(counts.expenseTotal)} label="Despesas do mês" />
          <StatCard value={formatBRL(counts.profit)} label="Lucro do mês" />
          <StatCard value={String(counts.activeClients)} label="Clientes ativos" bars={false} />
          <StatCard value={String(counts.activeContracts)} label="Contratos ativos" bars={false} />
        </div>
      )}
    </>
  );
}
