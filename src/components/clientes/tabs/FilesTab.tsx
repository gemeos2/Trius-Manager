import { EmptyState } from "@/components/ui/EmptyState";

export function FilesTab() {
  return (
    <div className="ds-card">
      <EmptyState title="Em breve" description="O upload de arquivos e documentos deste cliente chega em uma fase futura." />
    </div>
  );
}
