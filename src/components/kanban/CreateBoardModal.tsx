"use client";

import { useActionState } from "react";
import { Modal } from "@/components/ui/Modal";
import { InputField, TextareaField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { createBoard, type BoardFormState } from "@/app/gestao/(dashboard)/kanban/actions";

const initialState: BoardFormState = {};

export function CreateBoardModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [state, formAction, pending] = useActionState(createBoard, initialState);

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="t-h5" style={{ marginBottom: "1.5rem" }}>Novo board</h2>
      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {state.error && <div className="auth-error">{state.error}</div>}
        <InputField id="board-name" name="name" label="Nome" required placeholder="Ex: Desenvolvimento" />
        <TextareaField id="board-description" name="description" label="Descrição" placeholder="Opcional" rows={3} />
        <Button type="submit" loading={pending} cornerDots>
          {pending ? "Criando" : "Criar board"}
        </Button>
      </form>
    </Modal>
  );
}
