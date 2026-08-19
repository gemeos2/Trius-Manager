import { createClient } from "@/lib/supabase/server";
import type {
  ActivityEntry,
  ClientDetail,
  ClientProfitability,
  ClientStatus,
  ClientSummary,
  ClientTaskSummary,
  ContractSummary,
  ProjectSummary,
  RevenueSummary,
} from "./types";

const CLOSED_LIST_NAMES = ["concluido", "concluído", "feito", "done", "finalizado"];

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export type ClientSortKey = "name" | "revenueTotal";

export interface GetClientsOptions {
  search?: string;
  status?: ClientStatus;
  sortBy?: ClientSortKey;
  sortDir?: "asc" | "desc";
}

export async function getClients(organizationId: string, options: GetClientsOptions = {}): Promise<ClientSummary[]> {
  const supabase = await createClient();

  let query = supabase
    .from("clients")
    .select("id, name, company, status, monthly_value, entry_date, profiles:responsible_user_id(full_name)")
    .eq("organization_id", organizationId);

  if (options.search) {
    query = query.or(`name.ilike.%${options.search}%,company.ilike.%${options.search}%`);
  }
  if (options.status) {
    query = query.eq("status", options.status);
  }

  const [{ data, error }, { data: profitabilityRows }] = await Promise.all([
    query,
    supabase.from("client_profitability").select("client_id, revenue_total").eq("organization_id", organizationId),
  ]);

  if (error || !data) return [];

  const profitabilityByClient = new Map((profitabilityRows ?? []).map((p) => [p.client_id, p]));

  const summaries: ClientSummary[] = data.map((c) => {
    const profitability = profitabilityByClient.get(c.id);
    const responsible = c.profiles as unknown as { full_name: string } | null;
    return {
      id: c.id,
      name: c.name,
      company: c.company,
      status: c.status,
      monthlyValue: c.monthly_value,
      responsibleName: responsible?.full_name ?? null,
      entryDate: c.entry_date,
      revenueTotal: profitability?.revenue_total ?? 0,
    };
  });

  const sortBy = options.sortBy ?? "name";
  const dir = options.sortDir === "desc" ? -1 : 1;

  summaries.sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name) * dir;
    return (a[sortBy] - b[sortBy]) * dir;
  });

  return summaries;
}

export async function getClientsCount(organizationId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", organizationId);
  return count ?? 0;
}

export async function getClientDetail(clientId: string, organizationId: string): Promise<ClientDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .select(
      "id, name, company, email, phone, whatsapp, document_id, logo_url, status, monthly_value, notes, entry_date, responsible_user_id, created_at, profiles:responsible_user_id(full_name)"
    )
    .eq("id", clientId)
    .eq("organization_id", organizationId)
    .single();

  if (error || !data) return null;

  const responsible = data.profiles as unknown as { full_name: string } | null;

  return {
    id: data.id,
    name: data.name,
    company: data.company,
    email: data.email,
    phone: data.phone,
    whatsapp: data.whatsapp,
    documentId: data.document_id,
    logoUrl: data.logo_url,
    status: data.status,
    monthlyValue: data.monthly_value,
    notes: data.notes,
    entryDate: data.entry_date,
    responsibleUserId: data.responsible_user_id,
    responsibleName: responsible?.full_name ?? null,
    createdAt: data.created_at,
  };
}

export async function getClientProfitability(clientId: string): Promise<ClientProfitability> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("client_profitability")
    .select("revenue_total")
    .eq("client_id", clientId)
    .single();

  return {
    revenueTotal: data?.revenue_total ?? 0,
  };
}

export async function getClientContracts(clientId: string): Promise<ContractSummary[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("contracts")
    .select("id, title, value, status, is_recurring, signed_at, renewal_at, projects(name)")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((c) => ({
    id: c.id,
    title: c.title,
    value: c.value,
    status: c.status,
    isRecurring: c.is_recurring,
    signedAt: c.signed_at,
    renewalAt: c.renewal_at,
    projectName: (c.projects as unknown as { name: string } | null)?.name ?? null,
  }));
}

export async function getClientProjects(clientId: string): Promise<ProjectSummary[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("projects")
    .select("id, name, status, created_at")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  return (data ?? []).map((p) => ({ id: p.id, name: p.name, status: p.status, createdAt: p.created_at }));
}

export async function getClientRevenues(clientId: string): Promise<RevenueSummary[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("revenues")
    .select("id, description, amount, status, is_recurring, issue_date, due_date, paid_at")
    .eq("client_id", clientId)
    .order("issue_date", { ascending: false });

  return (data ?? []).map((r) => ({
    id: r.id,
    description: r.description,
    amount: r.amount,
    status: r.status,
    isRecurring: r.is_recurring,
    issueDate: r.issue_date,
    dueDate: r.due_date,
    paidAt: r.paid_at,
  }));
}

export async function getClientTasks(clientId: string): Promise<ClientTaskSummary[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("board_cards")
    .select("id, title, status, priority, due_date, board_lists(name, boards(name))")
    .eq("client_id", clientId)
    .is("archived_at", null);

  return (data ?? []).map((c) => {
    const list = c.board_lists as unknown as { name: string; boards: { name: string } | null } | null;
    const isDone = list ? CLOSED_LIST_NAMES.includes(normalize(list.name)) : false;
    return {
      id: c.id,
      title: c.title,
      status: c.status,
      priority: c.priority,
      dueDate: c.due_date,
      boardName: list?.boards?.name ?? "",
      isDone,
    };
  });
}

export async function getClientActivity(clientId: string): Promise<ActivityEntry[]> {
  const supabase = await createClient();

  const { data: cardIdsRaw } = await supabase.from("board_cards").select("id").eq("client_id", clientId);
  const cardIds = (cardIdsRaw ?? []).map((c) => c.id);

  const orFilter = cardIds.length > 0
    ? `and(entity_type.eq.client,entity_id.eq.${clientId}),and(entity_type.eq.board_card,entity_id.in.(${cardIds.join(",")}))`
    : `and(entity_type.eq.client,entity_id.eq.${clientId})`;

  const { data } = await supabase
    .from("activities")
    .select("id, action, metadata, created_at, profiles:user_id(full_name)")
    .or(orFilter)
    .order("created_at", { ascending: false })
    .limit(50);

  return (data ?? []).map((a) => ({
    id: a.id,
    action: a.action,
    metadata: (a.metadata as Record<string, unknown>) ?? {},
    createdAt: a.created_at,
    authorName: (a.profiles as unknown as { full_name: string } | null)?.full_name ?? "Sistema",
  }));
}
