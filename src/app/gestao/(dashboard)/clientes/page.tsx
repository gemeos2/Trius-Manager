import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getClients, getClientsCount, type ClientSortKey } from "@/lib/clientes/queries";
import { ClientListView } from "@/components/clientes/ClientListView";
import type { ClientStatus } from "@/types/database";

export const metadata: Metadata = { title: "Clientes — TRIUS" };

const SORT_KEYS: ClientSortKey[] = ["name", "revenueTotal"];

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; sort?: string; dir?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/gestao/login");
  if (!user.organizationId) redirect("/gestao/configuracoes");

  const sortBy = SORT_KEYS.includes(params.sort as ClientSortKey) ? (params.sort as ClientSortKey) : "name";

  const [clients, totalCount] = await Promise.all([
    getClients(user.organizationId, {
      search: params.q,
      status: params.status as ClientStatus | undefined,
      sortBy,
      sortDir: params.dir === "desc" ? "desc" : "asc",
    }),
    getClientsCount(user.organizationId),
  ]);

  return <ClientListView clients={clients} hasAnyClient={totalCount > 0} />;
}
