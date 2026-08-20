import { StatCard } from "@/components/ui/Card";
import type { ClientDetail, ClientProfitability } from "@/lib/clientes/types";

function formatBRL(value: number | null) {
  if (value === null) return "—";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

export function OverviewTab({ client, profitability }: { client: ClientDetail; profitability: ClientProfitability }) {
  return (
    <div>
      <div className="flex" style={{ gap: "1.25rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        <StatCard value={formatBRL(profitability.revenueTotal)} label="Receita total" />
      </div>

      <div className="ds-card">
        <div className="ds-card-header">
          <span className="t-h6">Dados do cliente</span>
        </div>
        <div className="ds-card-body client-overview-grid">
          <div>
            <div className="t-helper">Email</div>
            <div className="t-body-sm">{client.email ?? "—"}</div>
          </div>
          <div>
            <div className="t-helper">Telefone</div>
            <div className="t-body-sm">{client.phone ?? "—"}</div>
          </div>
          <div>
            <div className="t-helper">WhatsApp</div>
            <div className="t-body-sm">{client.whatsapp ?? "—"}</div>
          </div>
          <div>
            <div className="t-helper">CNPJ/CPF</div>
            <div className="t-body-sm">{client.documentId ?? "—"}</div>
          </div>
          <div>
            <div className="t-helper">Responsável interno</div>
            <div className="t-body-sm">{client.responsibleName ?? "—"}</div>
          </div>
          <div>
            <div className="t-helper">Nicho</div>
            <div className="t-body-sm">{client.segmentName ?? "—"}</div>
          </div>
          <div>
            <div className="t-helper">Data de entrada</div>
            <div className="t-body-sm">{formatDate(client.entryDate)}</div>
          </div>
          <div>
            <div className="t-helper">Valor mensal</div>
            <div className="t-body-sm">{formatBRL(client.monthlyValue)}</div>
          </div>
        </div>
        {client.notes && (
          <div className="ds-card-body" style={{ borderTop: "1px solid var(--off-blue-10)" }}>
            <div className="t-helper" style={{ marginBottom: ".375rem" }}>Observações</div>
            <p className="t-body-sm">{client.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
