"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Table, type TableColumn } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { deleteAccessCredential } from "@/app/gestao/(dashboard)/acessos/actions";
import type { AccessCredentialSummary } from "@/lib/acessos/types";

function PasswordCell({ password }: { password: string | null }) {
  const [visible, setVisible] = useState(false);
  const { showToast } = useToast();

  if (!password) return <span style={{ color: "var(--off-blue-40)" }}>—</span>;

  function copy() {
    navigator.clipboard.writeText(password!).then(() => showToast("Senha copiada."));
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
      <span className="font-mono t-body-sm">{visible ? password : "••••••••"}</span>
      <button type="button" className="access-icon-btn" onClick={() => setVisible((v) => !v)} aria-label={visible ? "Ocultar senha" : "Mostrar senha"}>
        {visible ? "Ocultar" : "Ver"}
      </button>
      <button type="button" className="access-icon-btn" onClick={copy} aria-label="Copiar senha">
        Copiar
      </button>
    </div>
  );
}

export function AccessTable({
  credentials,
  onEdit,
}: {
  credentials: AccessCredentialSummary[];
  onEdit: (credential: AccessCredentialSummary) => void;
}) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<AccessCredentialSummary | null>(null);
  const [pending, startTransition] = useTransition();
  const { showToast } = useToast();

  function confirmDelete() {
    if (!pendingDelete) return;
    startTransition(async () => {
      try {
        await deleteAccessCredential(pendingDelete.id);
        showToast("Acesso excluído.");
        setPendingDelete(null);
        router.refresh();
      } catch {
        showToast("Não foi possível excluir — tente novamente.");
      }
    });
  }

  const columns: TableColumn<AccessCredentialSummary>[] = [
    {
      key: "name",
      header: "Nome",
      render: (c) => (
        <div>
          <div style={{ color: "var(--color-off-blue)" }}>{c.name}</div>
          {c.notes && <div className="t-helper">{c.notes}</div>}
        </div>
      ),
    },
    {
      key: "url",
      header: "Link",
      render: (c) =>
        c.url ? (
          <a href={c.url} target="_blank" rel="noopener noreferrer" className="access-link">
            {c.url.replace(/^https?:\/\//, "")}
          </a>
        ) : (
          <span style={{ color: "var(--off-blue-40)" }}>—</span>
        ),
    },
    { key: "login", header: "Login", render: (c) => c.login ?? <span style={{ color: "var(--off-blue-40)" }}>—</span> },
    { key: "password", header: "Senha", render: (c) => <PasswordCell password={c.password} /> },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (c) => (
        <div style={{ display: "flex", gap: ".5rem", justifyContent: "flex-end" }}>
          <Button variant="transparent" size="sm" onClick={() => onEdit(c)}>Editar</Button>
          <Button variant="transparent" size="sm" onClick={() => setPendingDelete(c)}>Excluir</Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Table
        columns={columns}
        rows={credentials}
        getRowKey={(c) => c.id}
        emptyState={<EmptyState title="Nenhum acesso cadastrado" description="Adicione hospedagens, cursos e ferramentas que você usa." />}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Excluir acesso"
        description={pendingDelete ? `Tem certeza que deseja excluir "${pendingDelete.name}"? Essa ação não pode ser desfeita.` : undefined}
        confirmLabel="Excluir"
        pending={pending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
