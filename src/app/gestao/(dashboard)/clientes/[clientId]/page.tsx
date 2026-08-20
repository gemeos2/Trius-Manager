import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import {
  getClientActivity,
  getClientContracts,
  getClientDetail,
  getClientProfitability,
  getClientProjects,
  getClientRevenues,
  getClientSegments,
  getClientTasks,
} from "@/lib/clientes/queries";
import { ClientProfileHeader } from "@/components/clientes/ClientProfileHeader";
import { ClientProfileTabs } from "@/components/clientes/ClientProfileTabs";
import { OverviewTab } from "@/components/clientes/tabs/OverviewTab";
import { ProjectsTab } from "@/components/clientes/tabs/ProjectsTab";
import { TasksTab } from "@/components/clientes/tabs/TasksTab";
import { FinanceTab } from "@/components/clientes/tabs/FinanceTab";
import { ContractsTab } from "@/components/clientes/tabs/ContractsTab";
import { ActivityTab } from "@/components/clientes/tabs/ActivityTab";
import { FilesTab } from "@/components/clientes/tabs/FilesTab";

export const metadata: Metadata = { title: "Cliente — TRIUS" };

export default async function ClientProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { clientId } = await params;
  const { tab = "overview" } = await searchParams;

  const user = await getCurrentUser();
  if (!user) redirect("/gestao/login");
  if (!user.organizationId) notFound();

  const [client, segments] = await Promise.all([
    getClientDetail(clientId, user.organizationId),
    getClientSegments(user.organizationId),
  ]);
  if (!client) notFound();

  return (
    <>
      <ClientProfileHeader client={client} segments={segments} />
      <ClientProfileTabs clientId={clientId} />
      <div className="client-tab-content">
        <TabContent clientId={clientId} tab={tab} client={client} />
      </div>
    </>
  );
}

async function TabContent({ clientId, tab, client }: { clientId: string; tab: string; client: Awaited<ReturnType<typeof getClientDetail>> }) {
  if (!client) return null;

  switch (tab) {
    case "projects": {
      const projects = await getClientProjects(clientId);
      return <ProjectsTab projects={projects} />;
    }
    case "tasks": {
      const tasks = await getClientTasks(clientId);
      return <TasksTab tasks={tasks} />;
    }
    case "finance": {
      const revenues = await getClientRevenues(clientId);
      return <FinanceTab clientId={clientId} revenues={revenues} />;
    }
    case "contracts": {
      const contracts = await getClientContracts(clientId);
      return <ContractsTab clientId={clientId} contracts={contracts} />;
    }
    case "activity": {
      const activity = await getClientActivity(clientId);
      return <ActivityTab activity={activity} />;
    }
    case "files":
      return <FilesTab />;
    case "overview":
    default: {
      const profitability = await getClientProfitability(clientId);
      return <OverviewTab client={client} profitability={profitability} />;
    }
  }
}
