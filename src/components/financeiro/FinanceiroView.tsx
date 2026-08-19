"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { StatCard } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TransactionTable } from "./TransactionTable";
import { TransactionFormModal } from "./TransactionFormModal";
import { CategoryManager } from "./CategoryManager";
import { PeriodSelector } from "./PeriodSelector";
import type { CategorySummary, FinancialSummary, TransactionKind, TransactionSummary } from "@/lib/financeiro/types";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function TrendIcon({ direction }: { direction: "up" | "down" }) {
  return (
    <svg
      className={`btn-trend-icon ${direction === "down" ? "is-down" : ""}`}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface ClientOption {
  id: string;
  name: string;
}

interface FinanceiroViewProps {
  summary: FinancialSummary;
  transactions: TransactionSummary[];
  categories: CategorySummary[];
  clients: ClientOption[];
  hasAnyTransaction: boolean;
}

export function FinanceiroView({ summary, transactions, categories, clients, hasAnyTransaction }: FinanceiroViewProps) {
  const [modalState, setModalState] = useState<{ open: boolean; transaction?: TransactionSummary; defaultKind?: TransactionKind }>({ open: false });
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "lancamentos";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Financeiro</h1>
          <p className="page-sub">Receitas, despesas e o lucro real da empresa.</p>
        </div>
        <div style={{ display: "flex", gap: ".75rem" }}>
          <Button onClick={() => setModalState({ open: true, defaultKind: "receita" })} variant="transparent" cornerDots className="btn-revenue">
            <TrendIcon direction="up" /> Nova receita
          </Button>
          <Button onClick={() => setModalState({ open: true, defaultKind: "despesa" })} cornerDots className="btn-expense">
            <TrendIcon direction="down" /> Nova despesa
          </Button>
        </div>
      </div>

      <div className="flex" style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.25rem" }}>
        <PeriodSelector />
        <div className="finance-view-toggle">
          <button type="button" className={view === "lancamentos" ? "is-active" : ""} onClick={() => updateParam("view", "lancamentos")}>
            Lançamentos
          </button>
          <button type="button" className={view === "categorias" ? "is-active" : ""} onClick={() => updateParam("view", "categorias")}>
            Categorias
          </button>
        </div>
      </div>

      <div className="flex" style={{ gap: "1.25rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <StatCard value={formatBRL(summary.revenueTotal)} label="Receita total" trend="up" />
        <StatCard value={formatBRL(summary.expenseTotal)} label="Despesas totais" trend="down" />
        <StatCard value={formatBRL(summary.profit)} label="Lucro" />
        <StatCard value={`${summary.marginPct.toFixed(1)}%`} label="Margem" bars={false} />
      </div>

      {view === "categorias" ? (
        <CategoryManager categories={categories} />
      ) : !hasAnyTransaction ? (
        <div className="ds-card">
          <EmptyState
            title="Nenhum lançamento ainda"
            description="Registre a primeira receita ou despesa para acompanhar o financeiro da empresa."
            action={
              <Button onClick={() => setModalState({ open: true, defaultKind: "receita" })} cornerDots>
                Registrar o primeiro lançamento
              </Button>
            }
          />
        </div>
      ) : (
        <TransactionTable
          transactions={transactions}
          onEdit={(t) => setModalState({ open: true, transaction: t })}
        />
      )}

      <TransactionFormModal
        open={modalState.open}
        onClose={() => setModalState({ open: false })}
        categories={categories}
        clients={clients}
        transaction={modalState.transaction}
        defaultKind={modalState.defaultKind}
      />
    </>
  );
}
