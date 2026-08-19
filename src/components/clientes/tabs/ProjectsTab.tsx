import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import type { ProjectSummary } from "@/lib/clientes/types";

export function ProjectsTab({ projects }: { projects: ProjectSummary[] }) {
  if (projects.length === 0) {
    return (
      <div className="ds-card">
        <EmptyState title="Nenhum projeto vinculado" description="Projetos deste cliente aparecem aqui quando forem criados." />
      </div>
    );
  }

  return (
    <div className="client-list">
      {projects.map((p) => (
        <div key={p.id} className="ds-card client-list-item">
          <div className="ds-card-body client-list-item-header">
            <span className="t-body-sm">{p.name}</span>
            <Badge label={p.status} dot="hollow" />
          </div>
        </div>
      ))}
    </div>
  );
}
