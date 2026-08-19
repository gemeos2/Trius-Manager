import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/current-user";
import { Badge } from "@/components/ui/Badge";

const ROLE_LABEL: Record<string, string> = {
  administrador: "Administrador",
  gestor: "Gestor",
  colaborador: "Colaborador",
  financeiro: "Financeiro",
};

export default async function ConfiguracoesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/gestao/login");

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">Configurações</h1>
          <p className="page-sub">Dados da sua conta e organização.</p>
        </div>
      </div>

      <div className="ds-card" style={{ maxWidth: "34rem" }}>
        <div className="ds-card-header">
          <span className="t-h6">Sua conta</span>
        </div>
        <div className="ds-card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <div className="t-helper">Nome</div>
            <div className="t-body">{user.fullName}</div>
          </div>
          <div>
            <div className="t-helper">Email</div>
            <div className="t-body">{user.email}</div>
          </div>
          <div>
            <div className="t-helper">Função</div>
            <div style={{ marginTop: ".375rem" }}>
              <Badge label={ROLE_LABEL[user.role] ?? user.role} dot="solid" />
            </div>
          </div>
          <div>
            <div className="t-helper">Organização</div>
            <div className="t-body">{user.organizationName}</div>
          </div>
        </div>
      </div>
    </>
  );
}
