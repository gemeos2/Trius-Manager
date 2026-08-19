import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { getAccessCredentials } from "@/lib/acessos/queries";
import { AcessosView } from "@/components/acessos/AcessosView";

export const metadata: Metadata = { title: "Acessos — TRIUS" };

export default async function AcessosPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/gestao/login");
  if (!user.organizationId) redirect("/gestao/configuracoes");

  const credentials = await getAccessCredentials(user.organizationId);

  return <AcessosView credentials={credentials} />;
}
