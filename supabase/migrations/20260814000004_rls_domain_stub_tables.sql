-- TRIUS — Fase 1: RLS de isolamento por organização nas tabelas de domínio.
-- Políticas de restrição por role (ex.: só Financeiro grava em revenues)
-- ficam para quando essas fases forem construídas — aqui garantimos apenas
-- que uma organização nunca enxerga dados de outra.

alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.boards enable row level security;
alter table public.board_lists enable row level security;
alter table public.board_cards enable row level security;
alter table public.contracts enable row level security;
alter table public.categories enable row level security;
alter table public.revenues enable row level security;
alter table public.expenses enable row level security;
alter table public.notifications enable row level security;
alter table public.activities enable row level security;

-- Tabelas com organization_id direto: policy padrão idêntica.
create policy "clients_org_isolation" on public.clients
  for all using (organization_id = public.current_org_id())
  with check (organization_id = public.current_org_id());

create policy "projects_org_isolation" on public.projects
  for all using (organization_id = public.current_org_id())
  with check (organization_id = public.current_org_id());

create policy "boards_org_isolation" on public.boards
  for all using (organization_id = public.current_org_id())
  with check (organization_id = public.current_org_id());

create policy "contracts_org_isolation" on public.contracts
  for all using (organization_id = public.current_org_id())
  with check (organization_id = public.current_org_id());

create policy "categories_org_isolation" on public.categories
  for all using (organization_id = public.current_org_id())
  with check (organization_id = public.current_org_id());

create policy "revenues_org_isolation" on public.revenues
  for all using (organization_id = public.current_org_id())
  with check (organization_id = public.current_org_id());

create policy "expenses_org_isolation" on public.expenses
  for all using (organization_id = public.current_org_id())
  with check (organization_id = public.current_org_id());

create policy "notifications_org_isolation" on public.notifications
  for all using (organization_id = public.current_org_id())
  with check (organization_id = public.current_org_id());

create policy "activities_org_isolation" on public.activities
  for all using (organization_id = public.current_org_id())
  with check (organization_id = public.current_org_id());

-- board_lists / board_cards não têm organization_id próprio — isolamento via
-- join até boards.

create policy "board_lists_org_isolation" on public.board_lists
  for all using (
    exists (select 1 from public.boards b where b.id = board_id and b.organization_id = public.current_org_id())
  )
  with check (
    exists (select 1 from public.boards b where b.id = board_id and b.organization_id = public.current_org_id())
  );

create policy "board_cards_org_isolation" on public.board_cards
  for all using (
    exists (
      select 1 from public.board_lists l
      join public.boards b on b.id = l.board_id
      where l.id = list_id and b.organization_id = public.current_org_id()
    )
  )
  with check (
    exists (
      select 1 from public.board_lists l
      join public.boards b on b.id = l.board_id
      where l.id = list_id and b.organization_id = public.current_org_id()
    )
  );
