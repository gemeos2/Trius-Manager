-- TRIUS — Fase 1: RLS de isolamento por organização (núcleo)

-- Helper: organização do usuário autenticado. SECURITY DEFINER para poder
-- ler profiles sem entrar em recursão com a própria política de profiles.
create function public.current_org_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select organization_id from public.profiles where id = auth.uid();
$$;

create function public.current_role()
returns public.user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;

-- organizations: visível apenas para membros da própria organização.
create policy "organizations_select_own" on public.organizations
  for select using (id = public.current_org_id());

-- Nenhuma policy de insert direta: criação só via create_organization_and_admin (SECURITY DEFINER).

-- profiles: usuário vê o próprio perfil e os demais perfis da mesma organização.
create policy "profiles_select_self" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_select_same_org" on public.profiles
  for select using (organization_id is not null and organization_id = public.current_org_id());

create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid())
  with check (id = auth.uid());
