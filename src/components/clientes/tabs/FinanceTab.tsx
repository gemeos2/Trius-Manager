"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/Field";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/ToastProvider";
import { registerRevenueForClient } from "@/app/gestao/(dashboard)/clientes/[clientId]/actions";
import { TransactionStatusBadge } from "@/components/financeiro/TransactionStatusBadge";
import type { RevenueSummary } from "@/lib/clientes/types";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

export function FinanceTab({ clientId, revenues }: { clientId: string; revenues: RevenueSummary[] }) {
  const [activeForm, setActiveForm] = useState<"revenue" | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  function handleRevenue(formData: FormData) {
    startTransition(async () => {
      try {
        await registerRevenueForClient(formData);
        showToast("Receita registrada.");
        setActiveForm(null);
        router.refresh();
      } catch {
        showToast("Não foi possível registrar a receita — tente novamente.");
      }
    });
  }

  return (
    <div>
      <div className="client-tab-toolbar">
        <Button onClick={() => setActiveForm(activeForm === "revenue" ? null : "revenue")} variant="transparent" cornerDots>
          {activeForm === "revenue" ? "Cancelar" : "Lançar receita"}
        </Button>
      </div>

      {activeForm === "revenue" && (
        <form action={handleRevenue} className="client-inline-form">
          <input type="hidden" name="client_id" value={clientId} />
          <InputField id="revenue-description" name="description" label="Descrição" required placeholder="Ex: Mensalidade de agosto" />
          <div className="client-form-row">
            <InputField id="revenue-amount" name="amount" type="number" step="0.01" label="Valor" required placeholder="0,00" />
            <InputField id="revenue-due" name="due_date" type="date" label="Vencimento" />
          </div>
          <Checkbox id="revenue-recurring" name="is_recurring" label="Receita recorrente" />
          <Button type="submit" loading={pending} cornerDots>Salvar receita</Button>
        </form>
      )}

      <div>
        <div className="client-tab-section-title">Receitas</div>
        {revenues.length === 0 ? (
          <div className="ds-card"><EmptyState title="Nenhuma receita lançada" /></div>
        ) : (
          <div className="client-list">
            {revenues.map((r) => (
              <div key={r.id} className="ds-card client-list-item">
                <div className="ds-card-body">
                  <div className="client-list-item-header">
                    <span className="t-body-sm">{r.description}</span>
                    <span className="t-body-sm" style={{ color: "var(--color-off-blue)" }}>{formatBRL(r.amount)}</span>
                  </div>
                  <div className="client-list-item-meta">
                    <TransactionStatusBadge status={r.status} />
                    <span>Venc.: {formatDate(r.dueDate)}</span>
                    {r.isRecurring && <span>Recorrente</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
