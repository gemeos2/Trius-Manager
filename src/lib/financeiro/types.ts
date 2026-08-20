import type { TransactionCategoryType } from "@/types/database";

export type { TransactionCategoryType };
export type TransactionKind = TransactionCategoryType;

export interface CategorySummary {
  id: string;
  name: string;
  type: TransactionCategoryType;
}

export interface TransactionSummary {
  id: string;
  kind: TransactionKind;
  description: string;
  amount: number;
  date: string;
  categoryId: string | null;
  categoryName: string | null;
  clientId: string | null;
  clientName: string | null;
  status: string | null;
  isRecurring: boolean;
  installmentsTotal: number | null;
  installmentsPaid: number;
}

export interface FinancialSummary {
  revenueTotal: number;
  expenseTotal: number;
  profit: number;
  marginPct: number;
}

export interface MonthlyFinancialPoint {
  period: string;
  revenue: number;
  expense: number;
}

export const REVENUE_STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  vencido: "Vencido",
  cancelado: "Cancelado",
};

export const TRANSACTION_KIND_LABEL: Record<TransactionKind, string> = {
  receita: "Receita",
  despesa: "Despesa",
};
