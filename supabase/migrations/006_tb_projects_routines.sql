-- Additive only. Existing rows are untouched; project_id is nullable.
create table if not exists public.tb_projects(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 name text not null check(length(trim(name)) > 0), description text,
 color text not null default '#7445FF' check(color ~ '^#[0-9A-Fa-f]{6}$'),
 status text not null default 'active' check(status in('active','archived')),
 deadline date,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(id, user_id));
-- Routine blocks are stored as a jsonb array ({id,title,start,end,category}) so a template saves atomically.
create table if not exists public.tb_routines(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 name text not null check(length(trim(name)) > 0), description text,
 weekdays int[] not null default '{}' check(weekdays <@ array[0,1,2,3,4,5,6]),
 blocks jsonb not null default '[]' check(jsonb_typeof(blocks) = 'array'),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
alter table public.tb_tasks add column if not exists project_id uuid;
alter table public.tb_time_blocks add column if not exists project_id uuid;
do $$ begin
 if not exists (select 1 from pg_constraint where conname = 'tb_tasks_project_fk') then
  alter table public.tb_tasks add constraint tb_tasks_project_fk foreign key (project_id, user_id) references public.tb_projects(id, user_id) on delete set null (project_id); end if;
 if not exists (select 1 from pg_constraint where conname = 'tb_blocks_project_fk') then
  alter table public.tb_time_blocks add constraint tb_blocks_project_fk foreign key (project_id, user_id) references public.tb_projects(id, user_id) on delete set null (project_id); end if;
end $$;
create index if not exists tb_projects_user on public.tb_projects(user_id, status);
create index if not exists tb_routines_user on public.tb_routines(user_id);
create index if not exists tb_tasks_project on public.tb_tasks(project_id);
create index if not exists tb_blocks_project on public.tb_time_blocks(project_id);
do $$ declare t text; begin
 foreach t in array array['tb_projects','tb_routines'] loop
  execute format('alter table public.%I enable row level security', t);
  execute format('drop policy if exists %I on public.%I', t||'_own', t);
  execute format('create policy %I on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t||'_own', t);
  execute format('revoke all on public.%I from anon', t);
  execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  execute format('drop trigger if exists %I on public.%I', t||'_upd', t);
  execute format('create trigger %I before update on public.%I for each row execute function public.tb_set_updated_at()', t||'_upd', t);
 end loop; end $$;
