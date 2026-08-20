"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { ClientStatusDropdown } from "./ClientStatusDropdown";
import { ClientFormModal } from "./ClientFormModal";
import { deleteClientAction } from "@/app/gestao/(dashboard)/clientes/actions";
import type { ClientDetail, ClientSegment } from "@/lib/clientes/types";

export function ClientProfileHeader({ client, segments }: { client: ClientDetail; segments: ClientSegment[] }) {
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  async function handleDelete() {
    setPending(true);
    try {
      await deleteClientAction(client.id);
      showToast("Cliente excluído.");
      router.push("/gestao/clientes");
    } catch {
      setPending(false);
      setConfirmOpen(false);
      showToast("Não foi possível excluir — tente novamente.");
    }
  }

  return (
    <>
      <Link href="/gestao/clientes" className="kanban-board-back">← Clientes</Link>
      <div className="client-profile-header">
        <div>
          <div className="client-profile-title-row">
            <h1 className="page-title">{client.name}</h1>
            <ClientStatusDropdown clientId={client.id} status={client.status} />
          </div>
          {client.company && <p className="page-sub">{client.company}</p>}
        </div>
        <div style={{ display: "flex", gap: ".75rem" }}>
          <Button variant="transparent" onClick={() => setEditOpen(true)}>Editar</Button>
          <Button variant="transparent" onClick={() => setConfirmOpen(true)}>Excluir</Button>
        </div>
      </div>

      <ClientFormModal open={editOpen} onClose={() => setEditOpen(false)} client={client} segments={segments} />

      <ConfirmDialog
        open={confirmOpen}
        title={`Excluir "${client.name}"?`}
        description="Contratos e vínculos deste cliente serão desfeitos. Essa ação não pode ser desfeita."
        confirmLabel="Excluir cliente"
        pending={pending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
