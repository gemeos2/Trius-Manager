import { EmptyState } from "@/components/ui/EmptyState";

export function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
        </div>
      </div>
      <div className="ds-card">
        <EmptyState title="Em construção" description={description} />
      </div>
    </>
  );
}
