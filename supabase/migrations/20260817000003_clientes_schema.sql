-- TRIUS — Fase 3: schema de Clientes (status enum, campos novos, custo por
-- cliente, contratos recorrentes vs avulsos, anexos-stub).

create type public.client_status as enum ('lead', 'proposta', 'ativo', 'pausa', 'inadimplente', 'cancelado');

-- Confirmado com o usuário: tabela clients está vazia — conversão direta,
-- sem valores fora do vocabulário a normalizar antes do cast.
alter table public.clients
  alter column status drop default,
  alter column status type public.client_status using status::public.client_status,
  alter column status set default 'lead';

alter table public.clients
  add column logo_url text,
  add column document_id text,
  add column whatsapp text,
  add column responsible_user_id uuid references public.profiles (id) on delete set null,
  add column entry_date date not null default current_date;

-- Um custo pode estar ligado a um cliente sem projeto formal (ex: comissão).
alter table public.expenses add column client_id uuid references public.clients (id) on delete set null;

-- Distingue contrato recorrente (mensalidade formalizada) de avulso.
alter table public.contracts add column is_recurring boolean not null default false;

-- Schema-only nesta fase — sem bucket de Storage, sem UI de upload ainda.
create table public.client_attachments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients (id) on delete cascade,
  uploaded_by uuid references public.profiles (id) on delete set null,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

create index on public.clients (status);
create index on public.clients (responsible_user_id);
create index on public.expenses (client_id);
create index on public.client_attachments (client_id);
