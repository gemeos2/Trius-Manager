"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const TABS = [
  { key: "overview", label: "Visão geral" },
  { key: "projects", label: "Projetos" },
  { key: "tasks", label: "Tarefas" },
  { key: "finance", label: "Financeiro" },
  { key: "contracts", label: "Contratos" },
  { key: "activity", label: "Atividades" },
  { key: "files", label: "Arquivos" },
];

export function ClientProfileTabs({ clientId }: { clientId: string }) {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "overview";

  return (
    <nav className="client-tabs" aria-label="Abas do perfil do cliente">
      {TABS.map((tab) => (
        <Link
          key={tab.key}
          href={`/gestao/clientes/${clientId}?tab=${tab.key}`}
          className={`client-tab ${activeTab === tab.key ? "is-active" : ""}`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
