-- TRIUS — despesa parcelada: alternativa ao is_recurring para custos que se
-- repetem por um número fixo e conhecido de parcelas (ex: 12x de um curso),
-- em vez de indefinidamente (recorrente).

alter table public.expenses
  add column installments_total integer,
  add column installments_paid integer not null default 0;

alter table public.expenses
  add constraint expenses_installments_total_check check (installments_total is null or installments_total > 0),
  add constraint expenses_installments_paid_check check (installments_paid >= 0),
  add constraint expenses_installments_paid_le_total check (installments_total is null or installments_paid <= installments_total);
