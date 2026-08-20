"use client";

import { useState } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { MonthlyFinancialPoint } from "@/lib/financeiro/types";

const MONTH_LABEL = new Intl.DateTimeFormat("pt-BR", { month: "short" });

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
}

function formatMonth(period: string) {
  const [year, month] = period.split("-").map(Number);
  return MONTH_LABEL.format(new Date(year, month - 1, 1));
}

const WIDTH = 720;
const HEIGHT = 220;
const PADDING = { top: 16, right: 16, bottom: 28, left: 16 };

export function TimeSeriesChart({ months }: { months: MonthlyFinancialPoint[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const hasAnyValue = months.some((m) => m.revenue > 0 || m.expense > 0);
  if (!hasAnyValue) {
    return <EmptyState title="Sem movimentação no período" description="Registre receitas e despesas para ver a tendência aqui." />;
  }

  const max = Math.max(...months.map((m) => Math.max(m.revenue, m.expense)), 1);
  const plotWidth = WIDTH - PADDING.left - PADDING.right;
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom;

  const xFor = (i: number) => PADDING.left + (months.length === 1 ? plotWidth / 2 : (i / (months.length - 1)) * plotWidth);
  const yFor = (value: number) => PADDING.top + plotHeight - (value / max) * plotHeight;

  const revenuePath = months.map((m, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(m.revenue)}`).join(" ");
  const expensePath = months.map((m, i) => `${i === 0 ? "M" : "L"}${xFor(i)},${yFor(m.expense)}`).join(" ");

  const gridLines = [0, 0.5, 1];
  const hovered = hoverIndex !== null ? months[hoverIndex] : null;

  return (
    <div className="dash-timeseries">
      <div className="dash-legend">
        <span className="dash-legend-item"><i className="dash-legend-dot dash-legend-revenue" />Receita</span>
        <span className="dash-legend-item"><i className="dash-legend-dot dash-legend-expense" />Despesa</span>
      </div>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="Receita e despesa mensal"
        onMouseLeave={() => setHoverIndex(null)}
      >
        {gridLines.map((g) => (
          <line
            key={g}
            x1={PADDING.left}
            x2={WIDTH - PADDING.right}
            y1={PADDING.top + plotHeight * (1 - g)}
            y2={PADDING.top + plotHeight * (1 - g)}
            className="dash-gridline"
          />
        ))}

        <path d={revenuePath} className="dash-line-revenue" fill="none" />
        <path d={expensePath} className="dash-line-expense" fill="none" />

        {months.length > 0 && (
          <>
            <circle cx={xFor(months.length - 1)} cy={yFor(months[months.length - 1].revenue)} r={4} className="dash-line-revenue dash-end-dot" />
            <circle cx={xFor(months.length - 1)} cy={yFor(months[months.length - 1].expense)} r={4} className="dash-line-expense dash-end-dot" />
          </>
        )}

        {months.map((m, i) => (
          <g key={m.period}>
            <rect
              x={xFor(i) - plotWidth / months.length / 2}
              y={PADDING.top}
              width={plotWidth / months.length}
              height={plotHeight}
              fill="transparent"
              onMouseEnter={() => setHoverIndex(i)}
              onFocus={() => setHoverIndex(i)}
              tabIndex={0}
              aria-label={`${formatMonth(m.period)}: receita ${formatBRL(m.revenue)}, despesa ${formatBRL(m.expense)}`}
            />
            {hoverIndex === i && (
              <line x1={xFor(i)} x2={xFor(i)} y1={PADDING.top} y2={PADDING.top + plotHeight} className="dash-crosshair" />
            )}
            <text x={xFor(i)} y={HEIGHT - 8} textAnchor="middle" className="dash-axis-label">
              {formatMonth(m.period)}
            </text>
          </g>
        ))}
      </svg>

      {hovered && (
        <div className="dash-tooltip-fixed">
          <div className="dash-tooltip-title">{formatMonth(hovered.period)}</div>
          <div className="dash-tooltip-row"><i className="dash-legend-dot dash-legend-revenue" />Receita <strong>{formatBRL(hovered.revenue)}</strong></div>
          <div className="dash-tooltip-row"><i className="dash-legend-dot dash-legend-expense" />Despesa <strong>{formatBRL(hovered.expense)}</strong></div>
        </div>
      )}
    </div>
  );
}
