"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { InputField, TextareaField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { createClientAction, updateClientAction, type ClientFormState } from "@/app/gestao/(dashboard)/clientes/actions";
import { CLIENT_STATUS_LABEL, CLIENT_STATUS_OPTIONS } from "@/lib/clientes/types";
import type { ClientDetail } from "@/lib/clientes/types";
import type { ClientStatus } from "@/types/database";

const initialState: ClientFormState = {};

interface ClientFormModalProps {
  open: boolean;
  onClose: () => void;
  client?: ClientDetail;
}

export function ClientFormModal({ open, onClose, client }: ClientFormModalProps) {
  if (client) {
    return <EditForm open={open} onClose={onClose} client={client} />;
  }
  return <CreateForm open={open} onClose={onClose} />;
}

function CreateForm({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(createClientAction, initialState);

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="t-h5" style={{ marginBottom: "1.5rem" }}>Novo cliente</h2>
      <form action={formAction} className="client-form">
        {state.error && <div className="auth-error">{state.error}</div>}
        <InputField id="name" name="name" label="Nome" required placeholder="Nome do cliente" />
        <InputField id="company" name="company" label="Empresa" placeholder="Opcional" />
        <div className="client-form-row">
          <InputField id="email" name="email" type="email" label="Email" placeholder="Opcional" />
          <InputField id="phone" name="phone" label="Telefone" placeholder="Opcional" />
        </div>
        <div className="client-form-row">
          <InputField id="whatsapp" name="whatsapp" label="WhatsApp" placeholder="Opcional" />
          <InputField id="document_id" name="document_id" label="CNPJ/CPF" placeholder="Opcional" />
        </div>
        <div className="client-form-row">
          <div className="ds-field">
            <label htmlFor="status">Status</label>
            <div className="input-frame">
              <select id="status" name="status" className="ds-input" defaultValue="lead">
                {CLIENT_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{CLIENT_STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
          </div>
          <InputField id="monthly_value" name="monthly_value" type="number" step="0.01" label="Valor mensal" placeholder="0,00" />
        </div>
        <TextareaField id="notes" name="notes" label="Observações" placeholder="Opcional" rows={3} />
        <Button type="submit" loading={pending} cornerDots>
          {pending ? "Criando" : "Criar cliente"}
        </Button>
      </form>
    </Modal>
  );
}

function EditForm({ open, onClose, client }: { open: boolean; onClose: () => void; client: ClientDetail }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const router = useRouter();

  function handleSubmit(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) {
      setError("Informe o nome do cliente.");
      return;
    }
    setError(null);

    const monthlyValueRaw = String(formData.get("monthly_value") ?? "").trim();

    startTransition(async () => {
      try {
        await updateClientAction(client.id, {
          name,
          company: String(formData.get("company") ?? "").trim() || null,
          email: String(formData.get("email") ?? "").trim() || null,
          phone: String(formData.get("phone") ?? "").trim() || null,
          whatsapp: String(formData.get("whatsapp") ?? "").trim() || null,
          document_id: String(formData.get("document_id") ?? "").trim() || null,
          status: String(formData.get("status") ?? "lead") as ClientStatus,
          monthly_value: monthlyValueRaw ? Number(monthlyValueRaw) : null,
          notes: String(formData.get("notes") ?? "").trim() || null,
        });
        showToast("Cliente atualizado.");
        onClose();
        router.refresh();
      } catch {
        showToast("Não foi possível salvar — tente novamente.");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="t-h5" style={{ marginBottom: "1.5rem" }}>Editar cliente</h2>
      <form action={handleSubmit} className="client-form">
        {error && <div className="auth-error">{error}</div>}
        <InputField id="edit-name" name="name" label="Nome" required defaultValue={client.name} />
        <InputField id="edit-company" name="company" label="Empresa" defaultValue={client.company ?? ""} />
        <div className="client-form-row">
          <InputField id="edit-email" name="email" type="email" label="Email" defaultValue={client.email ?? ""} />
          <InputField id="edit-phone" name="phone" label="Telefone" defaultValue={client.phone ?? ""} />
        </div>
        <div className="client-form-row">
          <InputField id="edit-whatsapp" name="whatsapp" label="WhatsApp" defaultValue={client.whatsapp ?? ""} />
          <InputField id="edit-document" name="document_id" label="CNPJ/CPF" defaultValue={client.documentId ?? ""} />
        </div>
        <div className="client-form-row">
          <div className="ds-field">
            <label htmlFor="edit-status">Status</label>
            <div className="input-frame">
              <select id="edit-status" name="status" className="ds-input" defaultValue={client.status}>
                {CLIENT_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{CLIENT_STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
          </div>
          <InputField id="edit-monthly-value" name="monthly_value" type="number" step="0.01" label="Valor mensal" defaultValue={client.monthlyValue ?? ""} />
        </div>
        <TextareaField id="edit-notes" name="notes" label="Observações" defaultValue={client.notes ?? ""} rows={3} />
        <Button type="submit" loading={pending} cornerDots>
          {pending ? "Salvando" : "Salvar alterações"}
        </Button>
      </form>
    </Modal>
  );
}
