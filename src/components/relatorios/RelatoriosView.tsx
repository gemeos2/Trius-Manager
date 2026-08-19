"use client";

import { StatCard } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { ReportPeriodSelector } from "./ReportPeriodSelector";
import type { ReportData } from "@/lib/relatorios/types";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("pt-BR");
}

interface RelatoriosViewProps {
  data: ReportData;
  hasAnyData: boolean;
}

export function RelatoriosView({ data, hasAnyData }: RelatoriosViewProps) {
  const rangeEndInclusive = new Date(data.range.end);
  rangeEndInclusive.setDate(rangeEndInclusive.getDate() - 1);
  const rangeEndLabel = rangeEndInclusive.toISOString().slice(0, 10);

  return (
    <>
      <div className="page-header report-no-print">
        <div>
          <h1 className="page-title">Relatórios</h1>
          <p className="page-sub">
            Panorama de {formatDate(data.range.start)} até {formatDate(rangeEndLabel)}.
          </p>
        </div>
        <Button onClick={() => window.print()} variant="transparent" cornerDots>
          Exportar / imprimir
        </Button>
      </div>

      <div className="report-no-print" style={{ marginBottom: "2rem" }}>
        <ReportPeriodSelector />
      </div>

      {!hasAnyData ? (
        <div className="ds-card">
          <EmptyState
            title="Nenhum dado no período"
            description="Registre clientes, receitas e despesas para ver os indicadores da empresa aqui."
          />
        </div>
      ) : (
        <>
          <div className="report-section">
            <div className="report-section-title">Financeiro</div>
            <div className="flex" style={{ gap: "1.25rem", flexWrap: "wrap" }}>
              <StatCard value={formatBRL(data.revenueTotal)} label="Receita do período" />
              <StatCard value={formatBRL(data.expenseTotal)} label="Despesas do período" />
              <StatCard value={formatBRL(data.profit)} label="Lucro do período" />
              <StatCard value={`${data.marginPct.toFixed(1)}%`} label="Margem" bars={false} />
              <StatCard value={formatBRL(data.averageTicket)} label="Ticket médio" bars={false} />
            </div>
          </div>

          <div className="report-section">
            <div className="report-section-title">Clientes</div>
            <div className="flex" style={{ gap: "1.25rem", flexWrap: "wrap" }}>
              <StatCard value={String(data.newClients)} label="Clientes novos no período" bars={false} />
              <StatCard value={String(data.activeClients)} label="Clientes ativos (total)" bars={false} />
              <StatCard value={String(data.churnedClients)} label="Clientes que saíram (total)" bars={false} />
            </div>
          </div>

          <div className="report-section">
            <div className="report-section-title">Contratos</div>
            <div className="flex" style={{ gap: "1.25rem", flexWrap: "wrap" }}>
              <StatCard value={String(data.contractsSignedInPeriod)} label="Contratos fechados no período" bars={false} />
              <StatCard value={String(data.activeContracts)} label="Contratos ativos (total)" bars={false} />
              <StatCard value={String(data.endedContracts)} label="Contratos encerrados (total)" bars={false} />
            </div>
          </div>

          <div className="report-columns">
            <div className="report-section">
              <div className="report-section-title">Receita por categoria</div>
              <div className="ds-card">
                {data.revenueByCategory.length === 0 ? (
                  <EmptyState title="Sem receitas categorizadas" />
                ) : (
                  data.revenueByCategory.map((item) => (
                    <div key={item.categoryId ?? "none"} className="report-breakdown-row">
                      <span className="report-breakdown-name">{item.categoryName}</span>
                      <span className="report-breakdown-value">{formatBRL(item.total)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="report-section">
              <div className="report-section-title">Despesa por categoria</div>
              <div className="ds-card">
                {data.expenseByCategory.length === 0 ? (
                  <EmptyState title="Sem despesas categorizadas" />
                ) : (
                  data.expenseByCategory.map((item) => (
                    <div key={item.categoryId ?? "none"} className="report-breakdown-row">
                      <span className="report-breakdown-name">{item.categoryName}</span>
                      <span className="report-breakdown-value">{formatBRL(item.total)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="report-section">
            <div className="report-section-title">Top clientes por receita</div>
            <div className="ds-card">
              {data.topClients.length === 0 ? (
                <EmptyState title="Sem receitas vinculadas a clientes no período" />
              ) : (
                data.topClients.map((item) => (
                  <div key={item.clientId} className="report-breakdown-row">
                    <span className="report-breakdown-name">{item.clientName}</span>
                    <span className="report-breakdown-value">{formatBRL(item.revenueTotal)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
