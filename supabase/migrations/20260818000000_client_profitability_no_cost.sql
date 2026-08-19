-- TRIUS — Fase 3 (ajuste): custo por cliente sai do módulo Clientes.
-- Custos gerais da empresa passam a ser lançados na Fase 4 (Financeiro),
-- deduzidos do total de receitas de forma agregada, não por cliente.
-- A view volta a expressar só receita (lucro = receita até custos gerais
-- existirem em algum outro cálculo agregado).

-- create or replace view não permite remover colunas de uma view existente
-- (42P16) — precisa dropar e recriar.
drop view if exists public.client_profitability;

create view public.client_profitability with (security_invoker = true) as
with revenue_by_client as (
  select client_id, sum(amount) as total
  from public.revenues
  where client_id is not null
  group by client_id
)
select
  c.id as client_id,
  c.organization_id,
  coalesce(c.monthly_value, 0) + coalesce(rv.total, 0) as revenue_total
from public.clients c
left join revenue_by_client rv on rv.client_id = c.id;
