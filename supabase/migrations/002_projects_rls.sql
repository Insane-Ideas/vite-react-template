alter table public.projects enable row level security;
alter table public.project_memberships enable row level security;
alter table public.project_access_requests enable row level security;
alter table public.test_runs enable row level security;
alter table public.test_results enable row level security;

drop policy if exists "test_runs_select_authenticated" on public.test_runs;
drop policy if exists "test_results_select_authenticated" on public.test_results;

drop policy if exists "projects_select_member" on public.projects;
drop policy if exists "projects_select_authenticated" on public.projects;
drop policy if exists "memberships_select_own" on public.project_memberships;
drop policy if exists "requests_select_own_or_admin" on public.project_access_requests;
drop policy if exists "requests_insert_own" on public.project_access_requests;
drop policy if exists "requests_update_admin" on public.project_access_requests;
drop policy if exists "test_runs_select_member_project" on public.test_runs;
drop policy if exists "test_results_select_member_project" on public.test_results;

create policy "projects_select_authenticated"
on public.projects
for select
to authenticated
using (true);

create policy "memberships_select_own"
on public.project_memberships
for select
to authenticated
using (user_id = auth.uid());

create policy "requests_select_own_or_admin"
on public.project_access_requests
for select
to authenticated
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.project_memberships m
    where m.project_id = project_access_requests.project_id
      and m.user_id = auth.uid()
      and m.role = 'admin'
  )
);

create policy "requests_insert_own"
on public.project_access_requests
for insert
to authenticated
with check (user_id = auth.uid());

create policy "requests_update_admin"
on public.project_access_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.project_memberships m
    where m.project_id = project_access_requests.project_id
      and m.user_id = auth.uid()
      and m.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.project_memberships m
    where m.project_id = project_access_requests.project_id
      and m.user_id = auth.uid()
      and m.role = 'admin'
  )
  and status in ('pending', 'approved', 'rejected')
);

create policy "test_runs_select_member_project"
on public.test_runs
for select
to authenticated
using (
  exists (
    select 1
    from public.project_memberships m
    where m.project_id = test_runs.project_id
      and m.user_id = auth.uid()
  )
);

create policy "test_results_select_member_project"
on public.test_results
for select
to authenticated
using (
  exists (
    select 1
    from public.test_runs r
    join public.project_memberships m
      on m.project_id = r.project_id
    where r.id = test_results.run_id
      and m.user_id = auth.uid()
  )
);

revoke all on public.projects from anon;
revoke all on public.project_memberships from anon;
revoke all on public.project_access_requests from anon;
revoke all on public.test_runs from anon;
revoke all on public.test_results from anon;

grant select on public.projects to authenticated;
grant select on public.project_memberships to authenticated;
grant select, insert on public.project_access_requests to authenticated;
grant select on public.test_runs to authenticated;
grant select on public.test_results to authenticated;
