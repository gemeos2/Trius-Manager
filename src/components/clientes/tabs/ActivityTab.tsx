import { EmptyState } from "@/components/ui/EmptyState";
import type { ActivityEntry } from "@/lib/clientes/types";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function ActivityTab({ activity }: { activity: ActivityEntry[] }) {
  if (activity.length === 0) {
    return (
      <div className="ds-card">
        <EmptyState title="Nenhuma atividade ainda" description="Ações neste cliente e em cards vinculados aparecem aqui." />
      </div>
    );
  }

  return (
    <div className="ds-card">
      <div className="ds-card-body">
        {activity.map((entry) => (
          <div key={entry.id} className="activity-row">
            <span className="author">{entry.authorName}</span>
            <span>{entry.action}</span>
            <time>{formatDateTime(entry.createdAt)}</time>
          </div>
        ))}
      </div>
    </div>
  );
}
