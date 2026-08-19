import type { ReportRange } from "./types";

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function currentMonthRange(): ReportRange {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start: toISODate(start), end: toISODate(end) };
}

/**
 * Resolve o range do relatório a partir dos search params. Aceita um mês
 * (period=YYYY-MM), um range customizado (start=YYYY-MM-DD&end=YYYY-MM-DD,
 * end exclusivo) ou cai no mês atual.
 */
export function resolveReportRange(params: { period?: string; start?: string; end?: string }): ReportRange {
  if (params.start && params.end && /^\d{4}-\d{2}-\d{2}$/.test(params.start) && /^\d{4}-\d{2}-\d{2}$/.test(params.end)) {
    return { start: params.start, end: params.end };
  }

  if (params.period && /^\d{4}-\d{2}$/.test(params.period)) {
    const [year, month] = params.period.split("-").map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);
    return { start: toISODate(start), end: toISODate(end) };
  }

  return currentMonthRange();
}

export function shiftMonthParam(period: string | null, delta: number): string {
  const base = period && /^\d{4}-\d{2}$/.test(period) ? (() => {
    const [y, m] = period.split("-").map(Number);
    return new Date(y, m - 1, 1);
  })() : new Date();
  const next = new Date(base.getFullYear(), base.getMonth() + delta, 1);
  return `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
}

export function currentMonthParam(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
