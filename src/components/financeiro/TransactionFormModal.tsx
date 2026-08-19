"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { InputField } from "@/components/ui/Field";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { createTransaction, updateExpense, updateRevenue } from "@/app/gestao/(dashboard)/financeiro/actions";
import type { CategorySummary, TransactionKind, TransactionSummary } from "@/lib/financeiro/types";

interface ClientOption {
  id: string;
  name: string;
}

interface TransactionFormModalProps {
  open: boolean;
  onClose: () => void;
  categories: CategorySummary[];
  clients: ClientOption[];
  transaction?: TransactionSummary;
  defaultKind?: TransactionKind;
}

export function TransactionFormModal({ open, onClose, categories, clients, transaction, defaultKind = "receita" }: TransactionFormModalProps) {
  const kind: TransactionKind = transaction?.kind ?? defaultKind;
  const [isRecurring, setIsRecurring] = useState(Boolean(transaction?.isRecurring));
  const [isInstallment, setIsInstallment] = useState(Boolean(transaction?.installmentsTotal));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const router = useRouter();

  const kindCategories = categories.filter((c) => c.type === kind);
  const isEdit = Boolean(transaction);

  function handleSubmit(formData: FormData) {
    const description = String(formData.get("description") ?? "").trim();
    const amountRaw = String(formData.get("amount") ?? "").trim();
    if (!description || !amountRaw) {
      setError("Preencha descrição e valor.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        if (isEdit && transaction) {
          if (kind === "receita") {
            const categoryId = String(formData.get("category_id") ?? "") || null;
            const clientId = String(formData.get("client_id") ?? "") || null;
            const date = String(formData.get("date") ?? "") || undefined;
            await updateRevenue(transaction.id, {
              description,
              amount: Number(amountRaw),
              category_id: categoryId,
              client_id: clientId,
              issue_date: date,
            });
          } else {
            const installmentsTotalRaw = String(formData.get("installments_total") ?? "").trim();
            await updateExpense(transaction.id, {
              description,
              amount: Number(amountRaw),
              is_recurring: isRecurring,
              installments_total: isInstallment && installmentsTotalRaw ? Number(installmentsTotalRaw) : null,
            });
          }
        } else {
          formData.set("kind", kind);
          await createTransaction(formData);
        }
        showToast(kind === "receita" ? "Receita salva." : "Despesa salva.");
        onClose();
        router.refresh();
      } catch {
        showToast("Não foi possível salvar — tente novamente.");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="t-h5" style={{ marginBottom: "1.5rem" }}>
        {isEdit ? "Editar lançamento" : kind === "receita" ? "Nova receita" : "Nova despesa"}
      </h2>
      <form action={handleSubmit} className="client-form">
        {error && <div className="auth-error">{error}</div>}

        <InputField
          id="tx-description"
          name="description"
          label="Descrição"
          required
          defaultValue={transaction?.description}
          placeholder={kind === "receita" ? "Ex: Mensalidade de agosto" : "Ex: Assinatura de software"}
        />

        {kind === "despesa" ? (
          <InputField id="tx-amount" name="amount" type="number" step="0.01" label="Valor" required defaultValue={transaction?.amount} placeholder="0,00" />
        ) : (
          <div className="client-form-row">
            <InputField id="tx-amount" name="amount" type="number" step="0.01" label="Valor" required defaultValue={transaction?.amount} placeholder="0,00" />
            <InputField id="tx-date" name="date" type="date" label="Data" defaultValue={transaction?.date} />
          </div>
        )}

        {kind === "receita" && (
          <div className="client-form-row">
            <div className="ds-field">
              <label htmlFor="tx-category">Categoria</label>
              <div className="input-frame">
                <select id="tx-category" name="category_id" className="ds-input" defaultValue={transaction?.categoryId ?? ""}>
                  <option value="">Sem categoria</option>
                  {kindCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="ds-field">
              <label htmlFor="tx-client">Cliente</label>
              <div className="input-frame">
                <select id="tx-client" name="client_id" className="ds-input" defaultValue={transaction?.clientId ?? ""}>
                  <option value="">Sem cliente</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {kind === "despesa" && (
          <>
            <Checkbox
              id="tx-recurring"
              name="is_recurring"
              label="Despesa recorrente"
              checked={isRecurring}
              onChange={(e) => {
                setIsRecurring(e.target.checked);
                if (e.target.checked) setIsInstallment(false);
              }}
            />
            <Checkbox
              id="tx-installment"
              name="is_installment"
              label="Despesa parcelada"
              checked={isInstallment}
              onChange={(e) => {
                setIsInstallment(e.target.checked);
                if (e.target.checked) setIsRecurring(false);
              }}
            />
            {isInstallment && (
              <InputField
                id="tx-installments-total"
                name="installments_total"
                type="number"
                min={1}
                step={1}
                label="Quantas parcelas"
                required
                defaultValue={transaction?.installmentsTotal ?? undefined}
                placeholder="Ex: 12"
              />
            )}
          </>
        )}

        <Button type="submit" loading={pending} cornerDots>
          {isEdit ? "Salvar alterações" : kind === "receita" ? "Salvar receita" : "Salvar despesa"}
        </Button>
      </form>
    </Modal>
  );
}
