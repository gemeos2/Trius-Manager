import type { ClientStatus } from "@/types/database";

export type { ClientStatus };

export interface ClientSummary {
  id: string;
  name: string;
  company: string | null;
  status: ClientStatus;
  monthlyValue: number | null;
  responsibleName: string | null;
  entryDate: string;
  revenueTotal: number;
}

export interface ClientDetail {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  documentId: string | null;
  logoUrl: string | null;
  status: ClientStatus;
  monthlyValue: number | null;
  notes: string | null;
  entryDate: string;
  responsibleUserId: string | null;
  responsibleName: string | null;
  createdAt: string;
}

export interface ClientProfitability {
  revenueTotal: number;
}

export interface ContractSummary {
  id: string;
  title: string;
  value: number | null;
  status: string;
  isRecurring: boolean;
  signedAt: string | null;
  renewalAt: string | null;
  projectName: string | null;
}

export interface ProjectSummary {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

export interface RevenueSummary {
  id: string;
  description: string;
  amount: number;
  status: string;
  isRecurring: boolean;
  issueDate: string;
  dueDate: string | null;
  paidAt: string | null;
}

export interface ClientTaskSummary {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  boardName: string;
  isDone: boolean;
}

export interface ActivityEntry {
  id: string;
  action: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  authorName: string;
}

export const CLIENT_STATUS_LABEL: Record<ClientStatus, string> = {
  lead: "Lead",
  proposta: "Proposta",
  ativo: "Ativo",
  pausa: "Em pausa",
  inadimplente: "Inadimplente",
  cancelado: "Cancelado",
};

export const CLIENT_STATUS_OPTIONS: ClientStatus[] = ["lead", "proposta", "ativo", "pausa", "inadimplente", "cancelado"];
