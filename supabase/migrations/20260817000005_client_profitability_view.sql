-- TRIUS — Fase 3: view de lucratividade por cliente. security_invoker=true
-- porque só faz join com tabelas já protegidas por RLS de organization_id —
-- o isolamento é automático desde que executada pelo usuário autenticado.

create view public.client_profitability with (security_invoker = true) as
with revenue_by_client as (
  select client_id, sum(amount) as total
  from public.revenues
  where client_id is not null
  group by client_id
),
cost_by_client as (
  select client_id, sum(amount) as total
  from public.expenses
  where client_id is not null
  group by client_id
)
select
  c.id as client_id,
  c.organization_id,
  coalesce(c.monthly_value, 0) + coalesce(rv.total, 0) as revenue_total,
  coalesce(cs.total, 0) as cost_total,
  (coalesce(c.monthly_value, 0) + coalesce(rv.total, 0)) - coalesce(cs.total, 0) as profit,
  case
    when (coalesce(c.monthly_value, 0) + coalesce(rv.total, 0)) = 0 then 0
    else round(
      100 * ((coalesce(c.monthly_value, 0) + coalesce(rv.total, 0)) - coalesce(cs.total, 0))
      / (coalesce(c.monthly_value, 0) + coalesce(rv.total, 0)),
      2
    )
  end as margin_pct
from public.clients c
left join revenue_by_client rv on rv.client_id = c.id
left join cost_by_client cs on cs.client_id = c.id;
