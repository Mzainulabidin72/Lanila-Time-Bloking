-- Lanila Time Blocking: prefix tb_. Shares auth.users with other Lanila apps.
-- Does NOT create/alter profiles, categories, user_settings, or any aset_/lh_ tables.
create or replace function public.tb_set_updated_at() returns trigger
language plpgsql set search_path = '' as $$ begin new.updated_at = now(); return new; end $$;

create table if not exists public.tb_categories(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 name text not null check(length(trim(name)) > 0),
 color text not null default '#7445FF' check(color ~ '^#[0-9A-Fa-f]{6}$'),
 is_system boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(user_id, name));

create table if not exists public.tb_tasks(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 title text not null check(length(trim(title)) > 0),
 status text not null default 'todo' check(status in('inbox','todo','doing','done')),
 priority text not null default 'mid' check(priority in('low','mid','high')),
 est_minutes int check(est_minutes is null or est_minutes > 0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(id, user_id));

create table if not exists public.tb_time_blocks(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 title text not null check(length(trim(title)) > 0),
 block_date date not null, start_time time not null, end_time time not null,
 category text not null, done boolean not null default false, task_id uuid,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(end_time > start_time),
 -- composite FK: a block can only point to a task owned by the same user
 foreign key (task_id, user_id) references public.tb_tasks(id, user_id) on delete set null (task_id));

create table if not exists public.tb_focus_sessions(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 ended_at timestamptz not null default now(), minutes int not null check(minutes > 0),
 created_at timestamptz not null default now());

create index if not exists tb_blocks_user_date on public.tb_time_blocks(user_id, block_date);
create index if not exists tb_blocks_task on public.tb_time_blocks(task_id);
create index if not exists tb_tasks_user_status on public.tb_tasks(user_id, status);
create index if not exists tb_focus_user_ended on public.tb_focus_sessions(user_id, ended_at);

do $$ declare t text; begin
 foreach t in array array['tb_categories','tb_tasks','tb_time_blocks','tb_focus_sessions'] loop
  execute format('alter table public.%I enable row level security', t);
  execute format('drop policy if exists %I on public.%I', t||'_own', t);
  execute format('create policy %I on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t||'_own', t);
  execute format('revoke all on public.%I from anon', t);
  execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  if t <> 'tb_focus_sessions' then
   execute format('drop trigger if exists %I on public.%I', t||'_upd', t);
   execute format('create trigger %I before update on public.%I for each row execute function public.tb_set_updated_at()', t||'_upd', t);
  end if;
 end loop; end $$;
