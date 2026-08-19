import { createClient } from "@/lib/supabase/server";
import type { AccessCredentialSummary } from "./types";

export async function getAccessCredentials(organizationId: string): Promise<AccessCredentialSummary[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("access_credentials")
    .select("id, name, url, login, password, notes")
    .eq("organization_id", organizationId)
    .order("name", { ascending: true });

  return data ?? [];
}
