-- Core schema (subset). Apply with the Supabase CLI: supabase db push
create table public.time_blocks(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 title text not null check(length(title)>0), block_date date not null, start_time time not null, end_time time not null,
 category text not null, done boolean not null default false, task_id uuid,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), check(end_time>start_time));
create index on public.time_blocks(user_id,block_date);
create table public.tasks(
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 title text not null, status text not null default 'todo' check(status in('inbox','todo','doing','done')),
 priority text not null default 'mid' check(priority in('low','mid','high')), est_minutes int check(est_minutes>0),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create index on public.tasks(user_id,status);
alter table public.time_blocks enable row level security; alter table public.tasks enable row level security;
create policy own_blocks on public.time_blocks for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy own_tasks on public.tasks for all using(user_id=auth.uid()) with check(user_id=auth.uid());
