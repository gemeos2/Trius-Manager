-- TRIUS — nicho/segmento de cliente: tabela editável por organização (não
-- enum fechado) para permitir adicionar nichos novos sem migration.

create table public.client_segments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (organization_id, name)
);

create index on public.client_segments (organization_id);

alter table public.clients
  add column segment_id uuid references public.client_segments (id) on delete set null;

create index on public.clients (segment_id);

alter table public.client_segments enable row level security;

create policy "client_segments_org_isolation" on public.client_segments
  for all using (organization_id = public.current_org_id())
  with check (organization_id = public.current_org_id());

-- Seed: nichos comuns para cada organização já existente.
insert into public.client_segments (organization_id, name)
select o.id, seed.name
from public.organizations o
cross join (values
  ('Imobiliária'), ('Clínica Médica'), ('Advocacia'),
  ('Varejo'), ('Restaurante'), ('Educação'), ('Outro')
) as seed(name)
on conflict (organization_id, name) do nothing;

-- Seed automático para organizações criadas a partir de agora: estende
-- create_organization_and_admin (definida em
-- 20260814000001_profiles_and_auth_trigger.sql) para inserir os mesmos
-- nichos padrão logo após criar a organização.
create or replace function public.create_organization_and_admin(org_name text, admin_user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  base_slug text;
  final_slug text;
  suffix int := 0;
begin
  if not exists (select 1 from public.profiles where id = admin_user_id and organization_id is null) then
    raise exception 'Usuário inválido ou já vinculado a uma organização';
  end if;

  base_slug := regexp_replace(lower(trim(org_name)), '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  if base_slug = '' then
    base_slug := 'org';
  end if;

  final_slug := base_slug;
  while exists (select 1 from public.organizations where slug = final_slug) loop
    suffix := suffix + 1;
    final_slug := base_slug || '-' || suffix;
  end loop;

  insert into public.organizations (name, slug) values (org_name, final_slug)
  returning id into new_org_id;

  insert into public.client_segments (organization_id, name)
  select new_org_id, seed.name
  from (values
    ('Imobiliária'), ('Clínica Médica'), ('Advocacia'),
    ('Varejo'), ('Restaurante'), ('Educação'), ('Outro')
  ) as seed(name);

  update public.profiles
    set organization_id = new_org_id,
        role = 'administrador',
        updated_at = now()
    where id = admin_user_id;

  return new_org_id;
end;
$$;
