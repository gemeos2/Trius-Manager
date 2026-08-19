import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import type { ClientTaskSummary } from "@/lib/clientes/types";

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso + "T00:00:00").toLocaleDateString("pt-BR");
}

export function TasksTab({ tasks }: { tasks: ClientTaskSummary[] }) {
  if (tasks.length === 0) {
    return (
      <div className="ds-card">
        <EmptyState title="Nenhuma tarefa vinculada" description="Cards do Kanban vinculados a este cliente aparecem aqui." />
      </div>
    );
  }

  const open = tasks.filter((t) => !t.isDone);
  const done = tasks.filter((t) => t.isDone);

  return (
    <div>
      <div className="client-tab-section-title">Abertas ({open.length})</div>
      <div className="client-list" style={{ marginBottom: "2rem" }}>
        {open.map((t) => (
          <div key={t.id} className="ds-card client-list-item">
            <div className="ds-card-body client-list-item-header">
              <span className="t-body-sm">{t.title}</span>
              <span className="client-list-item-meta">
                <Badge label={t.priority} dot="hollow" />
                <span>{t.boardName}</span>
                {formatDate(t.dueDate) && <span>Prazo: {formatDate(t.dueDate)}</span>}
              </span>
            </div>
          </div>
        ))}
        {open.length === 0 && <p className="t-helper">Nenhuma tarefa aberta.</p>}
      </div>

      <div className="client-tab-section-title">Concluídas ({done.length})</div>
      <div className="client-list">
        {done.map((t) => (
          <div key={t.id} className="ds-card client-list-item">
            <div className="ds-card-body client-list-item-header">
              <span className="t-body-sm" style={{ color: "var(--off-blue-40)", textDecoration: "line-through" }}>{t.title}</span>
              <span className="client-list-item-meta">{t.boardName}</span>
            </div>
          </div>
        ))}
        {done.length === 0 && <p className="t-helper">Nenhuma tarefa concluída.</p>}
      </div>
    </div>
  );
}
