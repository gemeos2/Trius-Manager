export interface NavItem {
  href: string;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/gestao/dashboard", label: "Dashboard" },
  { href: "/gestao/projetos", label: "Projetos" },
  { href: "/gestao/kanban", label: "Kanban" },
  { href: "/gestao/tarefas", label: "Tarefas" },
  { href: "/gestao/clientes", label: "Clientes" },
  { href: "/gestao/financeiro", label: "Financeiro" },
  { href: "/gestao/relatorios", label: "Relatórios" },
  { href: "/gestao/acessos", label: "Acessos" },
  { href: "/gestao/configuracoes", label: "Configurações" },
];
