import type { ReactNode } from "react";

export interface TableColumn<T> {
  key: string;
  header: string;
  sortable?: boolean;
  align?: "left" | "right";
  render?: (row: T) => ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  sortKey?: string;
  sortDir?: "asc" | "desc";
  onSort?: (key: string) => void;
  emptyState?: ReactNode;
}

/**
 * Tabela genérica do design system — sem paginação nesta v1, sort é
 * responsabilidade de quem consome (via URL ou estado local). Não conhece
 * nada de domínio específico; reutilizável por qualquer lista futura
 * (Financeiro, Equipe, Relatórios).
 */
export function Table<T>({ columns, rows, getRowKey, onRowClick, sortKey, sortDir, onSort, emptyState }: TableProps<T>) {
  if (rows.length === 0 && emptyState) {
    return <div className="ds-table-empty">{emptyState}</div>;
  }

  return (
    <div className="ds-table-wrap">
      <table className="ds-table">
        <thead>
          <tr>
            {columns.map((col) => {
              const isSorted = sortKey === col.key;
              return (
                <th
                  key={col.key}
                  className={col.align === "right" ? "align-right" : ""}
                  onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
                  data-sortable={col.sortable ? "true" : undefined}
                >
                  {col.header}
                  {col.sortable && (
                    <span className="ds-table-sort-glyph" aria-hidden="true">
                      {isSorted ? (sortDir === "desc" ? "↓" : "↑") : ""}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowKey(row)} onClick={onRowClick ? () => onRowClick(row) : undefined} className={onRowClick ? "is-clickable" : ""}>
              {columns.map((col) => (
                <td key={col.key} className={col.align === "right" ? "align-right" : ""}>
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
