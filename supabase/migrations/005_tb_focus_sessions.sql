-- Additive only: existing sessions keep their data (defaults: type 'focus', status 'completed').
alter table public.tb_focus_sessions
 add column if not exists session_type text not null default 'focus' check (session_type in ('focus','short_break','long_break')),
 add column if not exists status text not null default 'completed' check (status in ('completed','interrupted')),
 add column if not exists planned_seconds int check (planned_seconds is null or planned_seconds > 0),
 add column if not exists actual_seconds int check (actual_seconds is null or actual_seconds >= 0),
 add column if not exists started_at timestamptz,
 add column if not exists objective text,
 add column if not exists task_id uuid;
do $$ begin
 if not exists (select 1 from pg_constraint where conname = 'tb_focus_task_fk') then
  alter table public.tb_focus_sessions add constraint tb_focus_task_fk
   foreign key (task_id, user_id) references public.tb_tasks(id, user_id) on delete set null (task_id);
 end if;
end $$;
-- project_id is intentionally absent: there is no projects table yet.
