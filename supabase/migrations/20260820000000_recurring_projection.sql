-- TRIUS — despesas/receitas recorrentes passam a ser projetadas mês a mês
-- em vez de contar só no mês em que a linha foi lançada. Uma recorrente
-- criada em junho conta em junho, julho, agosto... até ser desmarcada ou
-- excluída — sem acumular (é sempre o valor atual de amount, uma vez por
-- mês), como a fatura de um cartão. Edições de valor valem só dali pra
-- frente porque a projeção lê amount corrente, não um snapshot por mês.

create or replace view public.financial_summary with (security_invoker = true) as
with months as (
  select generate_series(
    least(
      (select min(date_trunc('month', issue_date)) from public.revenues),
      (select min(date_trunc('month', expense_date)) from public.expenses)
    ),
    date_trunc('month', current_date),
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
  -- receitas recorrentes: projetadas do mês de criação até o mês atual
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
  -- despesas recorrentes: projetadas do mês de criação até o mês atual
  select e.organization_id, m.period, 'despesa'::text as kind, e.amount as total
  from public.expenses e
  join months m on m.period >= date_trunc('month', e.expense_date)
  where e.is_recurring
) unified
group by organization_id, period, kind;
