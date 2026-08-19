import { createClient } from "./server";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  organizationId: string | null;
  organizationName: string;
}

/**
 * Busca o usuário autenticado + seu profile/organização. Retorna null se
 * não houver sessão — o proxy.ts já redireciona para /login nesse caso,
 * então esta função é a segunda camada de defesa dentro do layout.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, organization_id, organizations(name)")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? user.email ?? "",
    role: profile?.role ?? "colaborador",
    organizationId: profile?.organization_id ?? null,
    organizationName: (profile?.organizations as unknown as { name: string } | null)?.name ?? "Sem organização",
  };
}
