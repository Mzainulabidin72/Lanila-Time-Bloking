-- Additive only: existing tasks keep their data (start_date is nullable).
alter table public.tb_tasks add column if not exists start_date date;
do $$ begin
 if not exists (select 1 from pg_constraint where conname = 'tb_tasks_dates_chk') then
  alter table public.tb_tasks add constraint tb_tasks_dates_chk check (start_date is null or due_date is null or start_date <= due_date);
 end if;
end $$;
