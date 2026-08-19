"use client";

import { EmptyState } from "@/components/ui/EmptyState";

export default function DashboardError({ error }: { error: Error & { digest?: string } }) {
  return (
    <div className="auth-shell">
      <div style={{ maxWidth: "32rem", width: "100%" }} className="ds-card">
        <EmptyState title="Não foi possível carregar o painel" description={error.message} />
      </div>
    </div>
  );
}
