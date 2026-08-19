import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

const defaultIcon = (
  <svg className="es-icon" viewBox="0 0 5 5" fill="currentColor" aria-hidden="true">
    <rect x="0" y="0" width="1" height="1" />
    <rect x="2" y="0" width="1" height="1" />
    <rect x="4" y="0" width="1" height="1" />
    <rect x="0" y="2" width="1" height="1" />
    <rect x="4" y="2" width="1" height="1" />
    <rect x="0" y="4" width="1" height="1" />
    <rect x="2" y="4" width="1" height="1" />
    <rect x="4" y="4" width="1" height="1" />
  </svg>
);

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon ?? defaultIcon}
      <div className="es-title">{title}</div>
      {description && <p className="es-desc">{description}</p>}
      {action}
    </div>
  );
}
