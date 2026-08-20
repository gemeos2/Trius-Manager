import { EmptyState } from "@/components/ui/EmptyState";

interface RankedItem {
  label: string;
  value: number;
}

interface CategoryBarListProps {
  items: RankedItem[];
  emptyTitle: string;
  emptyDescription?: string;
  formatValue?: (value: number) => string;
  maxItems?: number;
}

const OPACITY_STEPS = ["dash-step-1", "dash-step-2", "dash-step-3", "dash-step-4", "dash-step-5"];

function defaultFormat(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CategoryBarList({ items, emptyTitle, emptyDescription, formatValue = defaultFormat, maxItems = 5 }: CategoryBarListProps) {
  if (items.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  const visible = items.slice(0, maxItems);
  const rest = items.slice(maxItems);
  const restTotal = rest.reduce((sum, item) => sum + item.value, 0);
  const rows = restTotal > 0 ? [...visible, { label: "Outras", value: restTotal }] : visible;
  const max = Math.max(...rows.map((r) => r.value), 1);

  return (
    <div className="dash-bar-list">
      {rows.map((row, i) => (
        <div key={row.label} className="dash-bar-row" tabIndex={0} data-tooltip={`${row.label}: ${formatValue(row.value)}`}>
          <span className="dash-bar-label">{row.label}</span>
          <div className="dash-bar-track">
            <div
              className={`dash-bar-fill ${OPACITY_STEPS[Math.min(i, OPACITY_STEPS.length - 1)]}`}
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
          <span className="dash-bar-value">{formatValue(row.value)}</span>
        </div>
      ))}
    </div>
  );
}
