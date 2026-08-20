import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getClients, getClientSegments, getClientsCount, type ClientSortKey } from "@/lib/clientes/queries";
import { ClientListView } from "@/components/clientes/ClientListView";
import type { ClientStatus } from "@/types/database";
import type { ClientSegment, ClientSummary } from "@/lib/clientes/types";

export const metadata: Metadata = { title: "Clientes — TRIUS" };

const SORT_KEYS: ClientSortKey[] = ["name", "revenueTotal"];

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; segment?: string; sort?: string; dir?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/gestao/login");

  const sortBy = SORT_KEYS.includes(params.sort as ClientSortKey) ? (params.sort as ClientSortKey) : "name";

  const orgId = user.organizationId;
  const [clients, totalCount, segments]: [ClientSummary[], number, ClientSegment[]] = orgId
    ? await Promise.all([
        getClients(orgId, {
          search: params.q,
          status: params.status as ClientStatus | undefined,
          segmentId: params.segment,
          sortBy,
          sortDir: params.dir === "desc" ? "desc" : "asc",
        }),
        getClientsCount(orgId),
        getClientSegments(orgId),
      ])
    : [[], 0, []];

  return <ClientListView clients={clients} hasAnyClient={totalCount > 0} segments={segments} />;
}
