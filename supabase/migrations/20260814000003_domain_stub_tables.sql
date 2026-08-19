-- TRIUS — Fase 1: tabelas de domínio (schema só, sem UI ainda) para não
-- exigir migrations destrutivas quando as fases seguintes forem construídas.

create type public.card_priority as enum ('baixa', 'media', 'alta', 'urgente');
create type public.transaction_category_type as enum ('receita', 'despesa');

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  company text,
  email text,
  phone text,
  status text not null default 'lead',
  monthly_value numeric(12,2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  name text not null,
  status text not null default 'ativo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.boards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  name text not null,
  description text,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.board_lists (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards (id) on delete cascade,
  name text not null,
  position integer not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.board_cards (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.board_lists (id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'aberto',
  priority public.card_priority not null default 'media',
  position integer not null default 0,
  start_date date,
  due_date date,
  client_id uuid references public.clients (id) on delete set null,
  project_id uuid references public.projects (id) on delete set null,
  cover_color text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid references public.clients (id) on delete cascade,
  project_id uuid references public.projects (id) on delete set null,
  title text not null,
  value numeric(12,2),
  status text not null default 'ativo',
  signed_at date,
  renewal_at date,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  type public.transaction_category_type not null,
  created_at timestamptz not null default now()
);

create table public.revenues (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  client_id uuid references public.clients (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  description text not null,
  amount numeric(12,2) not null,
  status text not null default 'pendente',
  is_recurring boolean not null default false,
  issue_date date not null default current_date,
  due_date date,
  paid_at date,
  created_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  category_id uuid references public.categories (id) on delete set null,
  related_project_id uuid references public.projects (id) on delete set null,
  description text not null,
  amount numeric(12,2) not null,
  is_recurring boolean not null default false,
  expense_date date not null default current_date,
  due_date date,
  paid_at date,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  entity_type text not null,
  entity_id uuid,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index on public.clients (organization_id);
create index on public.projects (organization_id);
create index on public.boards (organization_id);
create index on public.board_lists (board_id);
create index on public.board_cards (list_id);
create index on public.board_cards (client_id);
create index on public.board_cards (project_id);
create index on public.contracts (organization_id);
create index on public.categories (organization_id);
create index on public.revenues (organization_id);
create index on public.expenses (organization_id);
create index on public.notifications (organization_id, user_id);
create index on public.activities (organization_id, entity_type, entity_id);
