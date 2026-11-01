-- Additive only. Existing routines stay as they are (active = true, default color).
alter table public.tb_routines
 add column if not exists category text,
 add column if not exists color text not null default '#7445FF' check (color ~ '^#[0-9A-Fa-f]{6}$'),
 add column if not exists active boolean not null default true,
 add column if not exists start_date date,
 add column if not exists end_date date,
 add column if not exists last_applied_at timestamptz;
do $$ begin
 if not exists (select 1 from pg_constraint where conname = 'tb_routines_dates_chk') then
  alter table public.tb_routines add constraint tb_routines_dates_chk check (start_date is null or end_date is null or start_date <= end_date); end if;
 if not exists (select 1 from pg_constraint where conname = 'tb_routines_id_user_uq') then
  alter table public.tb_routines add constraint tb_routines_id_user_uq unique (id, user_id); end if;
end $$;
-- Source tracking on applied blocks (used to detect "already applied" and avoid duplicates).
alter table public.tb_time_blocks add column if not exists routine_id uuid, add column if not exists routine_block_id text;
do $$ begin
 if not exists (select 1 from pg_constraint where conname = 'tb_blocks_routine_fk') then
  alter table public.tb_time_blocks add constraint tb_blocks_routine_fk
   foreign key (routine_id, user_id) references public.tb_routines(id, user_id) on delete set null (routine_id); end if;
end $$;
create index if not exists tb_blocks_routine on public.tb_time_blocks(routine_id, block_date);
