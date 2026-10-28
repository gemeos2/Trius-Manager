"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Table, type TableColumn } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClientStatusDropdown } from "./ClientStatusDropdown";
import type { ClientSummary } from "@/lib/clientes/types";

export function ClientTable({ clients }: { clients: ClientSummary[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sortKey = searchParams.get("sort") ?? "name";
  const sortDir = (searchParams.get("dir") as "asc" | "desc" | null) ?? "asc";

  function handleSort(key: string) {
    const params = new URLSearchParams(searchParams);
    if (sortKey === key) {
      params.set("dir", sortDir === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", key);
      params.set("dir", "asc");
    }
    router.push(`?${params.toString()}`);
  }

  const columns: TableColumn<ClientSummary>[] = [
    {
      key: "name",
      header: "Nome",
      sortable: true,
      render: (c) => (
        <div>
          <div style={{ color: "var(--color-off-blue)" }}>{c.name}</div>
          {c.company && <div className="t-helper">{c.company}</div>}
        </div>
      ),
    },
    { key: "status", header: "Status", render: (c) => <ClientStatusDropdown clientId={c.id} status={c.status} /> },
    { key: "segmentName", header: "Nicho", render: (c) => c.segmentName ?? "—" },
    { key: "responsibleName", header: "Responsável", render: (c) => c.responsibleName ?? "—" },
  ];

  return (
    <Table
      columns={columns}
      rows={clients}
      getRowKey={(c) => c.id}
      onRowClick={(c) => router.push(`/gestao/clientes/${c.id}`)}
      sortKey={sortKey}
      sortDir={sortDir}
      onSort={handleSort}
      emptyState={<EmptyState title="Nenhum cliente encontrado" description="Ajuste a busca ou cadastre um novo cliente." />}
    />
  );
}
