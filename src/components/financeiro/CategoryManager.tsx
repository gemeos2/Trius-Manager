"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { InputField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { createCategory, deleteCategory, renameCategory } from "@/app/gestao/(dashboard)/financeiro/actions";
import { TRANSACTION_KIND_LABEL } from "@/lib/financeiro/types";
import type { CategorySummary, TransactionKind } from "@/lib/financeiro/types";

export function CategoryManager({ categories }: { categories: CategorySummary[] }) {
  const [pending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CategorySummary | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  const receitaCategories = categories.filter((c) => c.type === "receita");
  const despesaCategories = categories.filter((c) => c.type === "despesa");

  function handleCreate(formData: FormData) {
    startTransition(async () => {
      try {
        await createCategory(formData);
        showToast("Categoria criada.");
        router.refresh();
      } catch {
        showToast("Não foi possível criar a categoria — tente novamente.");
      }
    });
  }

  function handleRename(id: string, name: string) {
    startTransition(async () => {
      try {
        await renameCategory(id, name);
        showToast("Categoria renomeada.");
        setEditingId(null);
        router.refresh();
      } catch {
        showToast("Não foi possível renomear — tente novamente.");
      }
    });
  }

  function confirmDelete() {
    if (!pendingDelete) return;
    startTransition(async () => {
      try {
        await deleteCategory(pendingDelete.id);
        showToast("Categoria excluída.");
        setPendingDelete(null);
        router.refresh();
      } catch {
        showToast("Não foi possível excluir — tente novamente.");
      }
    });
  }

  function renderGroup(kind: TransactionKind, items: CategorySummary[]) {
    return (
      <div>
        <div className="client-tab-section-title">{TRANSACTION_KIND_LABEL[kind]}</div>
        {items.length === 0 ? (
          <div className="ds-card"><EmptyState title="Nenhuma categoria" /></div>
        ) : (
          <div className="client-list">
            {items.map((c) => (
              <div key={c.id} className="ds-card client-list-item">
                <div className="ds-card-body finance-category-row">
                  {editingId === c.id ? (
                    <form
                      action={(formData) => handleRename(c.id, String(formData.get("name") ?? ""))}
                      className="finance-category-edit-form"
                    >
                      <InputField id={`rename-${c.id}`} name="name" label="" defaultValue={c.name} />
                      <Button type="submit" size="sm" loading={pending} cornerDots>Salvar</Button>
                      <Button type="button" size="sm" variant="transparent" onClick={() => setEditingId(null)}>Cancelar</Button>
                    </form>
                  ) : (
                    <>
                      <span className="t-body-sm">{c.name}</span>
                      <div style={{ display: "flex", gap: ".5rem" }}>
                        <Button size="sm" variant="transparent" onClick={() => setEditingId(c.id)}>Renomear</Button>
                        <Button size="sm" variant="transparent" onClick={() => setPendingDelete(c)}>Excluir</Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <form action={handleCreate} className="client-inline-form">
        <InputField id="new-category-name" name="name" label="Nova categoria" required placeholder="Ex: Hospedagem" />
        <div className="ds-field">
          <label htmlFor="new-category-type">Tipo</label>
          <div className="input-frame">
            <select id="new-category-type" name="type" className="ds-input" defaultValue="receita">
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>
        </div>
        <Button type="submit" loading={pending} cornerDots>Criar categoria</Button>
      </form>

      <div className="finance-category-columns">
        {renderGroup("receita", receitaCategories)}
        {renderGroup("despesa", despesaCategories)}
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir categoria"
        description={pendingDelete ? `Lançamentos vinculados a "${pendingDelete.name}" ficarão sem categoria.` : undefined}
        confirmLabel="Excluir"
        pending={pending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
