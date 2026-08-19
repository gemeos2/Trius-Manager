"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { InputField } from "@/components/ui/Field";
import { Checkbox } from "@/components/ui/Checkbox";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { linkContract, deleteContract } from "@/app/gestao/(dashboard)/clientes/[clientId]/actions";
import type { ContractSummary } from "@/lib/clientes/types";

function formatBRL(value: number | null) {
  if (value === null) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

export function ContractsTab({ clientId, contracts }: { clientId: string; contracts: ContractSummary[] }) {
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ContractSummary | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { showToast } = useToast();

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      try {
        await linkContract(formData);
        showToast("Contrato criado.");
        setShowForm(false);
        router.refresh();
      } catch {
        showToast("Não foi possível criar o contrato — tente novamente.");
      }
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    startTransition(async () => {
      try {
        await deleteContract(clientId, target.id);
        showToast("Contrato excluído.");
        router.refresh();
      } catch {
        showToast("Não foi possível excluir — tente novamente.");
      }
    });
    setDeleteTarget(null);
  }

  return (
    <div>
      <div className="client-tab-toolbar">
        <Button onClick={() => setShowForm((v) => !v)} variant="transparent" cornerDots>
          {showForm ? "Cancelar" : "Novo contrato"}
        </Button>
      </div>

      {showForm && (
        <form action={handleCreate} className="client-inline-form">
          <input type="hidden" name="client_id" value={clientId} />
          <InputField id="contract-title" name="title" label="Título" required placeholder="Ex: Contrato de manutenção" />
          <div className="client-form-row">
            <InputField id="contract-value" name="value" type="number" step="0.01" label="Valor" placeholder="0,00" />
            <InputField id="contract-signed" name="signed_at" type="date" label="Assinado em" />
            <InputField id="contract-renewal" name="renewal_at" type="date" label="Renovação" />
          </div>
          <Checkbox id="contract-recurring" name="is_recurring" label="Contrato recorrente" />
          <Button type="submit" loading={pending} cornerDots>Salvar contrato</Button>
        </form>
      )}

      {contracts.length === 0 ? (
        <div className="ds-card">
          <EmptyState title="Nenhum contrato" description="Cadastre o primeiro contrato deste cliente." />
        </div>
      ) : (
        <div className="client-list">
          {contracts.map((c) => (
            <div key={c.id} className="ds-card client-list-item">
              <div className="ds-card-body">
                <div className="client-list-item-header">
                  <span className="t-body" style={{ fontFamily: "var(--ff-bold)" }}>{c.title}</span>
                  <button type="button" className="t-helper" onClick={() => setDeleteTarget(c)}>Excluir</button>
                </div>
                <div className="client-list-item-meta">
                  <span>{formatBRL(c.value)}</span>
                  <span>{c.isRecurring ? "Recorrente" : "Avulso"}</span>
                  <span>Assinado: {formatDate(c.signedAt)}</span>
                  <span>Renovação: {formatDate(c.renewalAt)}</span>
                  {c.projectName && <span>Projeto: {c.projectName}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={`Excluir contrato "${deleteTarget?.title}"?`}
        description="Essa ação não pode ser desfeita."
        confirmLabel="Excluir contrato"
        pending={pending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
