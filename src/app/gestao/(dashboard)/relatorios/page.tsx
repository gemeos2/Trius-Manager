import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getReportData } from "@/lib/relatorios/queries";
import { resolveReportRange } from "@/lib/relatorios/period";
import { RelatoriosView } from "@/components/relatorios/RelatoriosView";

export const metadata: Metadata = { title: "Relatórios — TRIUS" };

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; start?: string; end?: string }>;
}) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/gestao/login");
  if (!user.organizationId) redirect("/gestao/configuracoes");

  const range = resolveReportRange(params);
  const data = await getReportData(user.organizationId, range);

  const hasAnyData =
    data.revenueTotal > 0 ||
    data.expenseTotal > 0 ||
    data.newClients > 0 ||
    data.activeClients > 0 ||
    data.contractsSignedInPeriod > 0 ||
    data.activeContracts > 0;

  return <RelatoriosView data={data} hasAnyData={hasAnyData} />;
}
