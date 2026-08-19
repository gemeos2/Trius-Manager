-- TRIUS — aba Acessos: hospedagem, cursos e ferramentas com link/login/senha.
-- Lista dinâmica (ganha/perde acesso) — CRUD simples, sem histórico.

create type public.access_category as enum ('hospedagem', 'curso', 'ferramenta', 'outro');

create table public.access_credentials (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  category public.access_category not null default 'outro',
  url text,
  login text,
  password text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.access_credentials (organization_id);
create index on public.access_credentials (category);
