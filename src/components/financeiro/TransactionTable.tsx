"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Table, type TableColumn } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { TransactionKindBadge } from "./TransactionStatusBadge";
import { deleteTransaction } from "@/app/gestao/(dashboard)/financeiro/actions";
import type { TransactionSummary } from "@/lib/financeiro/types";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

export function TransactionTable({
  transactions,
  onEdit,
}: {
  transactions: TransactionSummary[];
  onEdit: (transaction: TransactionSummary) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sortKey = searchParams.get("sort") ?? "date";
  const sortDir = (searchParams.get("dir") as "asc" | "desc" | null) ?? "desc";
  const [pendingDelete, setPendingDelete] = useState<TransactionSummary | null>(null);
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  function handleSort(key: string) {
    const params = new URLSearchParams(searchParams);
    if (sortKey === key) {
      params.set("dir", sortDir === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", key);
      params.set("dir", "desc");
    }
    router.push(`?${params.toString()}`);
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    startTransition(async () => {
      try {
        await deleteTransaction(pendingDelete.kind, pendingDelete.id);
        showToast("Lançamento excluído.");
        setPendingDelete(null);
        router.refresh();
      } catch {
        showToast("Não foi possível excluir — tente novamente.");
      }
    });
  }

  const columns: TableColumn<TransactionSummary>[] = [
    {
      key: "description",
      header: "Descrição",
      render: (t) => (
        <div>
          <div style={{ color: "var(--color-off-blue)" }}>{t.description}</div>
          {(t.clientName || t.installmentsTotal) && (
            <div className="t-helper">
              {[t.clientName, t.installmentsTotal ? `${t.installmentsPaid}/${t.installmentsTotal}x` : null].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
      ),
    },
    { key: "kind", header: "Tipo", render: (t) => <TransactionKindBadge kind={t.kind} /> },
    { key: "categoryName", header: "Categoria", render: (t) => t.categoryName ?? "—" },
    { key: "date", header: "Data", sortable: true, render: (t) => formatDate(t.date) },
    {
      key: "amount",
      header: "Valor",
      sortable: true,
      align: "right",
      render: (t) => (t.kind === "despesa" ? `− ${formatBRL(t.amount)}` : formatBRL(t.amount)),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (t) => (
        <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
          {t.isMonthlyFee ? (
            // Mensalidade vem do cadastro do cliente: edita-se lá, não aqui.
            <Button variant="transparent" size="sm" onClick={() => router.push(`/gestao/clientes/${t.clientId}`)}>Ver cliente</Button>
          ) : (
            <>
              <Button variant="transparent" size="sm" onClick={() => onEdit(t)}>Editar</Button>
              <Button variant="transparent" size="sm" onClick={() => setPendingDelete(t)}>Excluir</Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        rows={transactions}
        getRowKey={(t) => `${t.kind}-${t.id}`}
        sortKey={sortKey}
        sortDir={sortDir}
        onSort={handleSort}
        emptyState={<EmptyState title="Nenhum lançamento encontrado" description="Ajuste os filtros ou registre um novo lançamento." />}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir lançamento"
        description={pendingDelete ? `Tem certeza que deseja excluir "${pendingDelete.description}"? Essa ação não pode ser desfeita.` : undefined}
        confirmLabel="Excluir"
        pending={pending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
