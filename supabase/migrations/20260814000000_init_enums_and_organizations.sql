-- TRIUS — Fase 1: enums núcleo + organizations
create extension if not exists "pgcrypto";

create type public.user_role as enum ('administrador', 'gestor', 'colaborador', 'financeiro');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

comment on table public.organizations is 'Uma organização (empresa/cliente da plataforma). Toda tabela de domínio referencia organization_id para isolamento via RLS.';
