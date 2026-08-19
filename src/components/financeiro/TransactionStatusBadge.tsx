import { Badge } from "@/components/ui/Badge";
import { REVENUE_STATUS_LABEL, TRANSACTION_KIND_LABEL } from "@/lib/financeiro/types";
import type { TransactionKind } from "@/lib/financeiro/types";

const REVENUE_STATUS_DOT: Record<string, "solid" | "hollow" | "cross"> = {
  pendente: "hollow",
  pago: "solid",
  vencido: "cross",
  cancelado: "cross",
};

export function TransactionStatusBadge({ status }: { status: string }) {
  return <Badge label={REVENUE_STATUS_LABEL[status] ?? status} dot={REVENUE_STATUS_DOT[status] ?? "hollow"} />;
}

const KIND_DOT: Record<TransactionKind, "arrow-up" | "arrow-down"> = {
  receita: "arrow-up",
  despesa: "arrow-down",
};

export function TransactionKindBadge({ kind }: { kind: TransactionKind }) {
  return <Badge label={TRANSACTION_KIND_LABEL[kind]} dot={KIND_DOT[kind]} />;
}
