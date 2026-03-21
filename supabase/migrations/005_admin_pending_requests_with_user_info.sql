create or replace function public.list_admin_pending_access_requests(
  p_project_id uuid
)
returns table (
  id uuid,
  project_id uuid,
  user_id uuid,
  reason text,
  status public.access_request_status,
  created_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid,
  requester_email text,
  requester_name text
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'not authenticated';
  end if;

  if not exists (
    select 1
    from public.project_memberships m
    where m.project_id = p_project_id
      and m.user_id = v_uid
      and m.role = 'admin'
  ) then
    raise exception 'not project admin';
  end if;

  return query
  select
    r.id,
    r.project_id,
    r.user_id,
    r.reason,
    r.status,
    r.created_at,
    r.reviewed_at,
    r.reviewed_by,
    u.email::text as requester_email,
    coalesce(
      nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
      nullif(trim(u.raw_user_meta_data ->> 'user_name'), ''),
      nullif(trim(u.email::text), '')
    ) as requester_name
  from public.project_access_requests r
  join auth.users u
    on u.id = r.user_id
  where r.project_id = p_project_id
    and r.status = 'pending'
  order by r.created_at asc;
end;
$$;

revoke all on function public.list_admin_pending_access_requests(uuid) from public;
grant execute on function public.list_admin_pending_access_requests(uuid) to authenticated;
