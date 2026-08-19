-- TRIUS — RLS de isolamento por organização em access_credentials.

alter table public.access_credentials enable row level security;

create policy "access_credentials_org_isolation" on public.access_credentials
  for all using (organization_id = public.current_org_id())
  with check (organization_id = public.current_org_id());
