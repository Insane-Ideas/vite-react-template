create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'project_role') then
    create type public.project_role as enum ('viewer', 'editor', 'admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'access_request_status') then
    create type public.access_request_status as enum ('pending', 'approved', 'rejected');
  end if;
end $$;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.project_memberships (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.project_role not null default 'viewer',
  approved_at timestamptz not null default now(),
  approved_by uuid references auth.users(id),
  primary key (project_id, user_id)
);

create table if not exists public.project_access_requests (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text,
  status public.access_request_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id)
);

create unique index if not exists project_access_requests_one_pending_idx
  on public.project_access_requests(project_id, user_id)
  where status = 'pending';

alter table public.test_runs
  add column if not exists project_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'test_runs_project_id_fkey'
      and conrelid = 'public.test_runs'::regclass
  ) then
    alter table public.test_runs
      add constraint test_runs_project_id_fkey
      foreign key (project_id) references public.projects(id);
  end if;
end $$;

create index if not exists test_runs_project_id_idx
  on public.test_runs(project_id);
