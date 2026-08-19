"use client";

export type FilterKey = "all" | "mine" | "overdue" | "today" | "high-priority" | "unassigned";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "mine", label: "Minhas tarefas" },
  { key: "overdue", label: "Atrasadas" },
  { key: "today", label: "Para hoje" },
  { key: "high-priority", label: "Alta prioridade" },
  { key: "unassigned", label: "Sem responsável" },
];

export function QuickFilters({ value, onChange }: { value: FilterKey; onChange: (key: FilterKey) => void }) {
  return (
    <div className="quick-filters">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          type="button"
          className={`quick-filter-chip ${value === f.key ? "is-active" : ""}`}
          onClick={() => onChange(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
