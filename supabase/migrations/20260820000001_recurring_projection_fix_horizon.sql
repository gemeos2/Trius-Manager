-- TRIUS — corrige projeção de recorrentes: a view anterior limitava a
-- projeção a date_trunc('month', current_date), então navegar para um mês
-- futuro no seletor de período (ex: setembro antes de agosto acabar) fazia a
-- despesa/receita recorrente sumir do resumo, embora a listagem de
-- lançamentos (getTransactions, em código) já projetasse corretamente sem
-- esse teto. A view não deve depender de "hoje" — só de existir mês
-- suficiente na série para cobrir o período pedido pela consulta.

create or replace view public.financial_summary with (security_invoker = true) as
with months as (
  select generate_series(
    least(
      (select min(date_trunc('month', issue_date)) from public.revenues),
      (select min(date_trunc('month', expense_date)) from public.expenses)
    ),
    date_trunc('month', current_date) + interval '5 years',
    interval '1 month'
  )::date as period
)
select organization_id, period, kind, sum(total) as total
from (
  -- receitas não recorrentes: só no mês do lançamento
  select organization_id, date_trunc('month', issue_date)::date as period, 'receita'::text as kind, amount as total
  from public.revenues
  where not is_recurring
  union all
  -- receitas recorrentes: projetadas do mês de criação em diante
  select r.organization_id, m.period, 'receita'::text as kind, r.amount as total
  from public.revenues r
  join months m on m.period >= date_trunc('month', r.issue_date)
  where r.is_recurring
  union all
  -- despesas não recorrentes: só no mês do lançamento
  select organization_id, date_trunc('month', expense_date)::date as period, 'despesa'::text as kind, amount as total
  from public.expenses
  where not is_recurring
  union all
  -- despesas recorrentes: projetadas do mês de criação em diante
  select e.organization_id, m.period, 'despesa'::text as kind, e.amount as total
  from public.expenses e
  join months m on m.period >= date_trunc('month', e.expense_date)
  where e.is_recurring
) unified
group by organization_id, period, kind;
