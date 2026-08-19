export interface ReportRange {
  start: string;
  end: string;
}

export interface CategoryBreakdownItem {
  categoryId: string | null;
  categoryName: string;
  total: number;
}

export interface TopClientItem {
  clientId: string;
  clientName: string;
  revenueTotal: number;
}

export interface ReportData {
  range: ReportRange;
  revenueTotal: number;
  expenseTotal: number;
  profit: number;
  marginPct: number;
  newClients: number;
  activeClients: number;
  churnedClients: number;
  contractsSignedInPeriod: number;
  activeContracts: number;
  endedContracts: number;
  averageTicket: number;
  revenueByCategory: CategoryBreakdownItem[];
  expenseByCategory: CategoryBreakdownItem[];
  topClients: TopClientItem[];
}
