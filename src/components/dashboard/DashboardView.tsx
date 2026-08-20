"use client";

import { useState } from "react";
import { StatCard } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TimeSeriesChart } from "./charts/TimeSeriesChart";
import { CategoryBarList } from "./charts/CategoryBarList";
import type { MonthOverMonthSummary, RankedItem } from "@/lib/dashboard/queries";
import type { MonthlyFinancialPoint } from "@/lib/financeiro/types";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function deltaInfo(current: number, previous: number): { delta?: string; trend?: "up" | "down" } {
  if (previous === 0) return {};
  const pct = ((current - previous) / previous) * 100;
  const trend = pct >= 0 ? "up" : "down";
  const sign = pct >= 0 ? "+" : "";
  return { delta: `${sign}${pct.toFixed(1)}% vs. mês anterior`, trend };
}

export interface DashboardData {
  activeClients: number;
  activeContracts: number;
  momSummary: MonthOverMonthSummary;
  series12: MonthlyFinancialPoint[];
  revenueByCategory: RankedItem[];
  topClients: RankedItem[];
  revenueBySegment: RankedItem[];
}

export function DashboardView({ data, hasAnyData }: { data: DashboardData; hasAnyData: boolean }) {
  const [horizon, setHorizon] = useState<6 | 12>(6);

  if (!hasAnyData) {
    return (
      <div className="ds-card">
        <EmptyState
          title="Nenhum dado ainda"
          description="Cadastre clientes, receitas e despesas para ver os indicadores da empresa aqui. Este painel é calculado a partir dos dados reais do sistema — nada é mostrado até existir algo para medir."
        />
      </div>
    );
  }

  const { current, previous } = data.momSummary;
  const revenueDelta = deltaInfo(current.revenueTotal, previous.revenueTotal);
  const expenseDelta = deltaInfo(current.expenseTotal, previous.expenseTotal);
  const profitDelta = deltaInfo(current.profit, previous.profit);
  const visibleMonths = data.series12.slice(-horizon);

  return (
    <>
      <div className="flex" style={{ gap: "1.25rem", flexWrap: "wrap" }}>
        <StatCard value={formatBRL(current.revenueTotal)} label="Receita do mês" delta={revenueDelta.delta} trend={revenueDelta.trend} />
        <StatCard value={formatBRL(current.expenseTotal)} label="Despesas do mês" delta={expenseDelta.delta} trend={expenseDelta.trend} invertTrendColor />
        <StatCard value={formatBRL(current.profit)} label="Lucro do mês" delta={profitDelta.delta} trend={profitDelta.trend} />
        <StatCard value={String(data.activeClients)} label="Clientes ativos" bars={false} />
        <StatCard value={String(data.activeContracts)} label="Contratos ativos" bars={false} />
      </div>

      <div className="dash-section">
        <div className="dash-section-header">
          <div className="report-section-title">Receita e despesa</div>
          <div className="dash-toggle">
            <button type="button" className={horizon === 6 ? "is-active" : ""} onClick={() => setHorizon(6)}>6 meses</button>
            <button type="button" className={horizon === 12 ? "is-active" : ""} onClick={() => setHorizon(12)}>12 meses</button>
          </div>
        </div>
        <div className="ds-card dash-chart-card">
          <TimeSeriesChart months={visibleMonths} />
        </div>
      </div>

      <div className="dash-columns">
        <div className="dash-section">
          <div className="report-section-title">Receita por categoria</div>
          <div className="ds-card dash-chart-card">
            <CategoryBarList
              items={data.revenueByCategory}
              emptyTitle="Sem receitas categorizadas este mês"
            />
          </div>
        </div>

        <div className="dash-section">
          <div className="report-section-title">Maiores clientes</div>
          <div className="ds-card dash-chart-card">
            <CategoryBarList
              items={data.topClients}
              emptyTitle="Nenhum cliente com faturamento registrado ainda"
              maxItems={10}
            />
          </div>
        </div>
      </div>

      <div className="dash-section">
        <div className="report-section-title">Receita por nicho</div>
        <div className="ds-card dash-chart-card">
          <CategoryBarList
            items={data.revenueBySegment}
            emptyTitle="Classifique seus clientes por nicho para ver esse gráfico"
            emptyDescription="Cadastre o nicho de mercado de cada cliente (imobiliária, clínica, etc.) para descobrir de onde vem mais receita."
          />
        </div>
      </div>
    </>
  );
}
