import type { CSSProperties } from "react";

/**
 * Convenção de loading state: blocos pulsantes na escala de opacidade do
 * design system (sem cor). Usar no formato/tamanho do conteúdo real que
 * vai substituir o skeleton.
 */
export function SkeletonText({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return <div className={`skeleton skeleton-text ${className}`} style={style} aria-hidden="true" />;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return <div className={`skeleton skeleton-card ${className}`} aria-hidden="true" />;
}

export function SkeletonStatRow({ count = 4 }: { count?: number }) {
  return (
    <div className="flex" style={{ gap: "1.25rem", flexWrap: "wrap" }} aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="ds-card stat-card">
          <SkeletonText className="w-1/2" style={{ height: "2rem", marginBottom: ".75rem" }} />
          <SkeletonText className="w-1/3" />
        </div>
      ))}
    </div>
  );
}
