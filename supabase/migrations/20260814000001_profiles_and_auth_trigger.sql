-- TRIUS — Fase 1: profiles + provisionamento de organização no cadastro

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete cascade,
  full_name text not null,
  email text not null,
  role public.user_role not null default 'colaborador',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Um perfil por usuário auth.users. organization_id fica null até o RPC de provisionamento (signup) rodar.';

-- Trigger: toda vez que auth.users ganha uma linha nova, cria o profile
-- correspondente lendo os metadados passados em supabase.auth.signUp().
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RPC atômico chamado pelo Server Action de cadastro: cria a organização e
-- vincula o usuário recém-criado como administrador. SECURITY DEFINER
-- porque neste ponto o profile ainda não tem organization_id (RLS bloquearia
-- um update comum).
create function public.create_organization_and_admin(org_name text, admin_user_id uuid)
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

  update public.profiles
    set organization_id = new_org_id,
        role = 'administrador',
        updated_at = now()
    where id = admin_user_id;

  return new_org_id;
end;
$$;

revoke all on function public.create_organization_and_admin(text, uuid) from public;
grant execute on function public.create_organization_and_admin(text, uuid) to authenticated;
