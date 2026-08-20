import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`ds-card ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`ds-card-header ${className}`}>{children}</div>;
}

export function CardBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`ds-card-body ${className}`}>{children}</div>;
}

interface StatCardProps {
  value: string;
  unit?: string;
  label: string;
  delta?: string;
  bars?: boolean;
  trend?: "up" | "down";
  invertTrendColor?: boolean;
}

export function StatCard({ value, unit, label, delta, bars = true, trend, invertTrendColor }: StatCardProps) {
  return (
    <div className="ds-card stat-card">
      <div className="st-value">
        {trend && (
          <svg
            className={`st-trend st-trend-${trend} ${invertTrendColor ? "st-trend-invert" : ""}`}
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path d="M12 19V5M12 5L5 12M12 5L19 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        {value}
        {unit && <span className="unit">{unit}</span>}
      </div>
      <div className="st-label">{label}</div>
      {delta && <div className="st-delta">{delta}</div>}
      {bars && (
        <div className="st-bars" aria-hidden="true">
          <i /><i /><i /><i />
        </div>
      )}
    </div>
  );
}
