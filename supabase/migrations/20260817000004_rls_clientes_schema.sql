-- TRIUS — Fase 3: RLS de client_attachments (única tabela nova desta fase —
-- as demais só ganharam colunas em tabelas já protegidas por RLS existente).

alter table public.client_attachments enable row level security;

create policy "client_attachments_org_isolation" on public.client_attachments
  for all using (
    exists (select 1 from public.clients c where c.id = client_id and c.organization_id = public.current_org_id())
  )
  with check (
    exists (select 1 from public.clients c where c.id = client_id and c.organization_id = public.current_org_id())
  );
