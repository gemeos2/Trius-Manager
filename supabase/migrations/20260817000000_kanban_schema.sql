-- TRIUS — Fase 2: schema do Kanban (membros, labels, checklists, comentários,
-- anexos-stub) + RPCs de reordenação atômica.

create table public.card_members (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.board_cards (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (card_id, user_id)
);

create table public.labels (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  name text not null,
  color_token text not null default 'wh-40',
  created_at timestamptz not null default now()
);

create table public.card_labels (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.board_cards (id) on delete cascade,
  label_id uuid not null references public.labels (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (card_id, label_id)
);

create table public.checklists (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.board_cards (id) on delete cascade,
  title text not null default 'Checklist',
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  checklist_id uuid not null references public.checklists (id) on delete cascade,
  title text not null,
  done boolean not null default false,
  assignee_id uuid references public.profiles (id) on delete set null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.card_comments (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.board_cards (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

-- Schema-only nesta fase — sem bucket de Storage, sem UI de upload ainda.
create table public.card_attachments (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references public.board_cards (id) on delete cascade,
  uploaded_by uuid references public.profiles (id) on delete set null,
  file_name text not null,
  file_path text not null,
  file_size bigint,
  mime_type text,
  created_at timestamptz not null default now()
);

create index on public.card_members (card_id);
create index on public.card_members (user_id);
create index on public.labels (organization_id);
create index on public.card_labels (card_id);
create index on public.card_labels (label_id);
create index on public.checklists (card_id);
create index on public.checklist_items (checklist_id);
create index on public.card_comments (card_id);
create index on public.card_attachments (card_id);

-- ---------------------------------------------------------------------
-- RPCs de reordenação atômica (mesmo padrão de create_organization_and_admin:
-- lógica no Postgres para evitar corrida entre múltiplas chamadas do client).
-- ---------------------------------------------------------------------

-- Reindexa a posição de todas as listas de um board na ordem recebida.
create function public.reorder_lists(p_board_id uuid, p_ordered_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.boards
    where id = p_board_id and organization_id = public.current_org_id()
  ) then
    raise exception 'Board não encontrado ou sem permissão';
  end if;

  update public.board_lists as l
    set position = t.ord - 1
    from unnest(p_ordered_ids) with ordinality as t(id, ord)
    where l.id = t.id and l.board_id = p_board_id;
end;
$$;

-- Reindexa a posição de todos os cards de uma lista na ordem recebida.
create function public.reorder_cards(p_list_id uuid, p_ordered_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.board_lists l
    join public.boards b on b.id = l.board_id
    where l.id = p_list_id and b.organization_id = public.current_org_id()
  ) then
    raise exception 'Lista não encontrada ou sem permissão';
  end if;

  update public.board_cards as c
    set position = t.ord - 1
    from unnest(p_ordered_ids) with ordinality as t(id, ord)
    where c.id = t.id and c.list_id = p_list_id;
end;
$$;

-- Move um card para outra lista (mesmo board ou não) numa posição alvo,
-- reindexando a lista de origem e a de destino numa única transação.
create function public.move_card(p_card_id uuid, p_target_list_id uuid, p_target_position integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source_list_id uuid;
begin
  select list_id into v_source_list_id from public.board_cards where id = p_card_id;

  if v_source_list_id is null then
    raise exception 'Card não encontrado';
  end if;

  if not exists (
    select 1 from public.board_lists l
    join public.boards b on b.id = l.board_id
    where l.id = p_target_list_id and b.organization_id = public.current_org_id()
  ) then
    raise exception 'Lista de destino não encontrada ou sem permissão';
  end if;

  -- abre espaço na lista de destino a partir da posição alvo
  update public.board_cards
    set position = position + 1
    where list_id = p_target_list_id and position >= p_target_position;

  update public.board_cards
    set list_id = p_target_list_id, position = p_target_position, updated_at = now()
    where id = p_card_id;

  -- reindexa a lista de origem pra fechar o buraco deixado (se mudou de lista)
  if v_source_list_id <> p_target_list_id then
    update public.board_cards as c
      set position = sub.rn - 1
      from (
        select id, row_number() over (order by position) as rn
        from public.board_cards
        where list_id = v_source_list_id
      ) as sub
      where c.id = sub.id;
  end if;
end;
$$;

revoke all on function public.reorder_lists(uuid, uuid[]) from public;
revoke all on function public.reorder_cards(uuid, uuid[]) from public;
revoke all on function public.move_card(uuid, uuid, integer) from public;
grant execute on function public.reorder_lists(uuid, uuid[]) to authenticated;
grant execute on function public.reorder_cards(uuid, uuid[]) to authenticated;
grant execute on function public.move_card(uuid, uuid, integer) to authenticated;
