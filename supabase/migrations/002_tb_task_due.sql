-- Additive only: no data is deleted or rewritten.
alter table public.tb_tasks add column if not exists due_date date;
