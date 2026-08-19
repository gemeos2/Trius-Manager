-- TRIUS — Fase 4: view agregada de receita/despesa por mês, org-wide.
-- Substitui o cálculo ingênuo (sem período) que hoje mora em dashboard/page.tsx
-- e retoma o lucro/margem da empresa, agora agregado por organização em vez
-- de por cliente (custo por cliente foi removido de propósito na Fase 3).

create view public.financial_summary with (security_invoker = true) as
select
  organization_id,
  date_trunc('month', issue_date)::date as period,
  'receita'::text as kind,
  sum(amount) as total
from public.revenues
group by organization_id, date_trunc('month', issue_date)
union all
select
  organization_id,
  date_trunc('month', expense_date)::date as period,
  'despesa'::text as kind,
  sum(amount) as total
from public.expenses
group by organization_id, date_trunc('month', expense_date);
