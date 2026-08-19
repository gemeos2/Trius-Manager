-- TRIUS — Fase 2: RPC para duplicar um board (estrutura — listas e cards,
-- sem checklists/membros/labels/comentários/anexos, que ficam de fora
-- propositalmente por serem conteúdo específico do card original).

create function public.duplicate_board(p_board_id uuid, p_new_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id uuid;
  v_project_id uuid;
  v_description text;
  v_new_board_id uuid;
  v_list record;
  v_new_list_id uuid;
begin
  select organization_id, project_id, description
    into v_org_id, v_project_id, v_description
    from public.boards
    where id = p_board_id and organization_id = public.current_org_id();

  if v_org_id is null then
    raise exception 'Board não encontrado ou sem permissão';
  end if;

  insert into public.boards (organization_id, project_id, name, description)
    values (v_org_id, v_project_id, p_new_name, v_description)
    returning id into v_new_board_id;

  for v_list in
    select id, name, position
    from public.board_lists
    where board_id = p_board_id and archived_at is null
    order by position
  loop
    insert into public.board_lists (board_id, name, position)
      values (v_new_board_id, v_list.name, v_list.position)
      returning id into v_new_list_id;

    insert into public.board_cards (
      list_id, title, description, status, priority, position,
      start_date, due_date, client_id, project_id, cover_color
    )
    select
      v_new_list_id, title, description, status, priority, position,
      start_date, due_date, client_id, project_id, cover_color
    from public.board_cards
    where list_id = v_list.id and archived_at is null;
  end loop;

  return v_new_board_id;
end;
$$;

revoke all on function public.duplicate_board(uuid, text) from public;
grant execute on function public.duplicate_board(uuid, text) to authenticated;
