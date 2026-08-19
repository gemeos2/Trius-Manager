"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClientTable } from "./ClientTable";
import { ClientFormModal } from "./ClientFormModal";
import { CLIENT_STATUS_LABEL, CLIENT_STATUS_OPTIONS } from "@/lib/clientes/types";
import type { ClientSummary } from "@/lib/clientes/types";

export function ClientListView({ clients, hasAnyClient }: { clients: ClientSummary[]; hasAnyClient: boolean }) {
  const [modalOpen, setModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`);
  }

  function updateParamDebounced(key: string, value: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => updateParam(key, value), 350);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-sub">Cadastro, contratos e rentabilidade por cliente.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} cornerDots>
          Novo cliente
        </Button>
      </div>

      {!hasAnyClient ? (
        <div className="ds-card">
          <EmptyState
            title="Nenhum cliente ainda"
            description="Cadastre o primeiro cliente para acompanhar contratos, receitas e rentabilidade."
            action={
              <Button onClick={() => setModalOpen(true)} cornerDots>
                Cadastrar o primeiro cliente
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div className="client-filters">
            <div className="input-frame client-filter-search">
              <input
                className="ds-input"
                placeholder="Buscar por nome ou empresa…"
                defaultValue={searchParams.get("q") ?? ""}
                onChange={(e) => updateParamDebounced("q", e.target.value)}
              />
            </div>
            <div className="input-frame">
              <select
                className="ds-input"
                defaultValue={searchParams.get("status") ?? ""}
                onChange={(e) => updateParam("status", e.target.value)}
              >
                <option value="">Todos os status</option>
                {CLIENT_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{CLIENT_STATUS_LABEL[s]}</option>
                ))}
              </select>
            </div>
          </div>

          <ClientTable clients={clients} />
        </>
      )}

      <ClientFormModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
