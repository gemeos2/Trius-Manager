import { Accordion } from "@/components/ui/Accordion";
import type { ActivityEntry } from "@/lib/kanban/types";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function ActivityLog({ activity }: { activity: ActivityEntry[] }) {
  if (activity.length === 0) return null;

  return (
    <Accordion title={`Atividade (${activity.length})`}>
      {activity.map((entry) => (
        <div key={entry.id} className="activity-row">
          <span className="author">{entry.authorName}</span>
          <span>{entry.action}</span>
          <time>{formatDateTime(entry.createdAt)}</time>
        </div>
      ))}
    </Accordion>
  );
}
