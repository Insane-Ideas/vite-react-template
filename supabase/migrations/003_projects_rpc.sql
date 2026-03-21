create or replace function public.request_project_access(
  p_project_id uuid,
  p_reason text default null
)
returns public.project_access_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_existing_pending public.project_access_requests;
  v_created public.project_access_requests;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if not exists (select 1 from public.projects p where p.id = p_project_id) then
    raise exception 'project not found';
  end if;

  if exists (
    select 1
    from public.project_memberships m
    where m.project_id = p_project_id
      and m.user_id = v_uid
  ) then
    raise exception 'already a member';
  end if;

  select *
  into v_existing_pending
  from public.project_access_requests r
  where r.project_id = p_project_id
    and r.user_id = v_uid
    and r.status = 'pending'
  limit 1;

  if found then
    return v_existing_pending;
  end if;

  insert into public.project_access_requests (project_id, user_id, reason)
  values (p_project_id, v_uid, nullif(trim(coalesce(p_reason, '')), ''))
  returning * into v_created;

  return v_created;
end;
$$;

create or replace function public.review_project_access_request(
  p_request_id uuid,
  p_decision public.access_request_status,
  p_role public.project_role default 'viewer'
)
returns public.project_access_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_request public.project_access_requests;
  v_updated public.project_access_requests;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if p_decision = 'pending' then
    raise exception 'invalid decision';
  end if;

  select *
  into v_request
  from public.project_access_requests r
  where r.id = p_request_id
  for update;

  if not found then
    raise exception 'request not found';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'request already reviewed';
  end if;

  if not exists (
    select 1
    from public.project_memberships m
    where m.project_id = v_request.project_id
      and m.user_id = v_uid
      and m.role = 'admin'
  ) then
    raise exception 'not project admin';
  end if;

  if p_decision = 'approved' then
    insert into public.project_memberships (
      project_id,
      user_id,
      role,
      approved_at,
      approved_by
    )
    values (
      v_request.project_id,
      v_request.user_id,
      p_role,
      now(),
      v_uid
    )
    on conflict (project_id, user_id) do update
      set role = excluded.role,
          approved_at = now(),
          approved_by = v_uid;
  end if;

  update public.project_access_requests r
  set status = p_decision,
      reviewed_at = now(),
      reviewed_by = v_uid
  where r.id = p_request_id
  returning * into v_updated;

  return v_updated;
end;
$$;

create or replace function public.create_project_with_admin(
  p_slug text,
  p_name text
)
returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_project public.projects;
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  insert into public.projects (slug, name)
  values (trim(p_slug), trim(p_name))
  returning * into v_project;

  insert into public.project_memberships (
    project_id,
    user_id,
    role,
    approved_at,
    approved_by
  )
  values (
    v_project.id,
    v_uid,
    'admin',
    now(),
    v_uid
  )
  on conflict (project_id, user_id) do update
    set role = 'admin',
        approved_at = now(),
        approved_by = v_uid;

  return v_project;
end;
$$;

revoke all on function public.request_project_access(uuid, text) from public;
revoke all on function public.review_project_access_request(uuid, public.access_request_status, public.project_role) from public;
revoke all on function public.create_project_with_admin(text, text) from public;

grant execute on function public.request_project_access(uuid, text) to authenticated;
grant execute on function public.review_project_access_request(uuid, public.access_request_status, public.project_role) to authenticated;
grant execute on function public.create_project_with_admin(text, text) to authenticated;
