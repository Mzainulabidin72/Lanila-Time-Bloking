-- Additive only: existing rows keep their data (priority defaults to 'mid').
alter table public.tb_time_blocks
 add column if not exists description text,
 add column if not exists notes text,
 add column if not exists priority text not null default 'mid' check (priority in ('low','mid','high'));
