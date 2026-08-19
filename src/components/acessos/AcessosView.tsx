"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { AccessTable } from "./AccessTable";
import { AccessFormModal } from "./AccessFormModal";
import type { AccessCredentialSummary } from "@/lib/acessos/types";

export function AcessosView({ credentials }: { credentials: AccessCredentialSummary[] }) {
  const [modalState, setModalState] = useState<{ open: boolean; credential?: AccessCredentialSummary }>({ open: false });

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Acessos</h1>
          <p className="page-sub">Hospedagens, cursos e ferramentas — links, logins e senhas.</p>
        </div>
        <Button onClick={() => setModalState({ open: true })} cornerDots>
          Novo acesso
        </Button>
      </div>

      {credentials.length === 0 ? (
        <div className="ds-card">
          <EmptyState
            title="Nenhum acesso cadastrado"
            description="Registre o primeiro acesso de hospedagem, curso ou ferramenta."
            action={
              <Button onClick={() => setModalState({ open: true })} cornerDots>
                Registrar o primeiro acesso
              </Button>
            }
          />
        </div>
      ) : (
        <AccessTable credentials={credentials} onEdit={(c) => setModalState({ open: true, credential: c })} />
      )}

      <AccessFormModal
        open={modalState.open}
        onClose={() => setModalState({ open: false })}
        credential={modalState.credential}
      />
    </>
  );
}
