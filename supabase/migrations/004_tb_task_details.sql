-- Additive only: existing tasks keep all data.
alter table public.tb_tasks add column if not exists description text, add column if not exists notes text;
