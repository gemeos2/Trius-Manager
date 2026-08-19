"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { InputField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { createAccessCredential, updateAccessCredential } from "@/app/gestao/(dashboard)/acessos/actions";
import type { AccessCredentialSummary } from "@/lib/acessos/types";

interface AccessFormModalProps {
  open: boolean;
  onClose: () => void;
  credential?: AccessCredentialSummary;
}

export function AccessFormModal({ open, onClose, credential }: AccessFormModalProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const router = useRouter();

  const isEdit = Boolean(credential);

  function handleSubmit(formData: FormData) {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) {
      setError("Preencha o nome.");
      return;
    }
    setError(null);

    startTransition(async () => {
      try {
        if (isEdit && credential) {
          await updateAccessCredential(credential.id, {
            name,
            url: String(formData.get("url") ?? "").trim() || null,
            login: String(formData.get("login") ?? "").trim() || null,
            password: String(formData.get("password") ?? "").trim() || null,
            notes: String(formData.get("notes") ?? "").trim() || null,
          });
        } else {
          await createAccessCredential(formData);
        }
        showToast(isEdit ? "Acesso atualizado." : "Acesso adicionado.");
        onClose();
        router.refresh();
      } catch {
        showToast("Não foi possível salvar — tente novamente.");
      }
    });
  }

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="t-h5" style={{ marginBottom: "1.5rem" }}>{isEdit ? "Editar acesso" : "Novo acesso"}</h2>
      <form action={handleSubmit} className="client-form">
        {error && <div className="auth-error">{error}</div>}

        <InputField
          id="access-name"
          name="name"
          label="Nome"
          required
          defaultValue={credential?.name}
          placeholder="Ex: Hostinger, Netflix, Figma"
        />

        <InputField
          id="access-url"
          name="url"
          type="url"
          label="Link"
          defaultValue={credential?.url ?? undefined}
          placeholder="https://..."
        />

        <div className="client-form-row">
          <InputField
            id="access-login"
            name="login"
            label="Login"
            defaultValue={credential?.login ?? undefined}
            placeholder="usuario@email.com"
          />
          <InputField
            id="access-password"
            name="password"
            label="Senha"
            defaultValue={credential?.password ?? undefined}
            placeholder="••••••••"
          />
        </div>

        <InputField
          id="access-notes"
          name="notes"
          label="Notas"
          defaultValue={credential?.notes ?? undefined}
          placeholder="Ex: plano anual, renova em março"
        />

        <Button type="submit" loading={pending} cornerDots>
          {isEdit ? "Salvar alterações" : "Salvar acesso"}
        </Button>
      </form>
    </Modal>
  );
}
