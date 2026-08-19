-- TRIUS — Fase 2: RLS de isolamento por organização nas tabelas do Kanban.
-- Mesmo padrão join-up-através-de-boards já usado em board_cards_org_isolation
-- (20260814000004), só um ou dois níveis mais fundo conforme a tabela.

alter table public.card_members enable row level security;
alter table public.labels enable row level security;
alter table public.card_labels enable row level security;
alter table public.checklists enable row level security;
alter table public.checklist_items enable row level security;
alter table public.card_comments enable row level security;
alter table public.card_attachments enable row level security;

-- labels: org-scoped direto, mesmo padrão flat de categories/clients.
create policy "labels_org_isolation" on public.labels
  for all using (organization_id = public.current_org_id())
  with check (organization_id = public.current_org_id());

-- card_members / card_labels / checklists / card_comments / card_attachments:
-- join board_cards -> board_lists -> boards.
create policy "card_members_org_isolation" on public.card_members
  for all using (
    exists (
      select 1 from public.board_cards c
      join public.board_lists l on l.id = c.list_id
      join public.boards b on b.id = l.board_id
      where c.id = card_id and b.organization_id = public.current_org_id()
    )
  )
  with check (
    exists (
      select 1 from public.board_cards c
      join public.board_lists l on l.id = c.list_id
      join public.boards b on b.id = l.board_id
      where c.id = card_id and b.organization_id = public.current_org_id()
    )
  );

create policy "card_labels_org_isolation" on public.card_labels
  for all using (
    exists (
      select 1 from public.board_cards c
      join public.board_lists l on l.id = c.list_id
      join public.boards b on b.id = l.board_id
      where c.id = card_id and b.organization_id = public.current_org_id()
    )
  )
  with check (
    exists (
      select 1 from public.board_cards c
      join public.board_lists l on l.id = c.list_id
      join public.boards b on b.id = l.board_id
      where c.id = card_id and b.organization_id = public.current_org_id()
    )
  );

create policy "checklists_org_isolation" on public.checklists
  for all using (
    exists (
      select 1 from public.board_cards c
      join public.board_lists l on l.id = c.list_id
      join public.boards b on b.id = l.board_id
      where c.id = card_id and b.organization_id = public.current_org_id()
    )
  )
  with check (
    exists (
      select 1 from public.board_cards c
      join public.board_lists l on l.id = c.list_id
      join public.boards b on b.id = l.board_id
      where c.id = card_id and b.organization_id = public.current_org_id()
    )
  );

create policy "card_comments_org_isolation" on public.card_comments
  for all using (
    exists (
      select 1 from public.board_cards c
      join public.board_lists l on l.id = c.list_id
      join public.boards b on b.id = l.board_id
      where c.id = card_id and b.organization_id = public.current_org_id()
    )
  )
  with check (
    exists (
      select 1 from public.board_cards c
      join public.board_lists l on l.id = c.list_id
      join public.boards b on b.id = l.board_id
      where c.id = card_id and b.organization_id = public.current_org_id()
    )
  );

create policy "card_attachments_org_isolation" on public.card_attachments
  for all using (
    exists (
      select 1 from public.board_cards c
      join public.board_lists l on l.id = c.list_id
      join public.boards b on b.id = l.board_id
      where c.id = card_id and b.organization_id = public.current_org_id()
    )
  )
  with check (
    exists (
      select 1 from public.board_cards c
      join public.board_lists l on l.id = c.list_id
      join public.boards b on b.id = l.board_id
      where c.id = card_id and b.organization_id = public.current_org_id()
    )
  );

-- checklist_items: um nível mais fundo — checklist_items -> checklists -> board_cards -> board_lists -> boards.
create policy "checklist_items_org_isolation" on public.checklist_items
  for all using (
    exists (
      select 1 from public.checklists cl
      join public.board_cards c on c.id = cl.card_id
      join public.board_lists l on l.id = c.list_id
      join public.boards b on b.id = l.board_id
      where cl.id = checklist_id and b.organization_id = public.current_org_id()
    )
  )
  with check (
    exists (
      select 1 from public.checklists cl
      join public.board_cards c on c.id = cl.card_id
      join public.board_lists l on l.id = c.list_id
      join public.boards b on b.id = l.board_id
      where cl.id = checklist_id and b.organization_id = public.current_org_id()
    )
  );
