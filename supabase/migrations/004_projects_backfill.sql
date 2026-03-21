insert into public.projects (slug, name)
select distinct trim(r.project), trim(r.project)
from public.test_runs r
where r.project is not null
  and trim(r.project) <> ''
on conflict (slug) do nothing;

update public.test_runs r
set project_id = p.id
from public.projects p
where r.project_id is null
  and r.project is not null
  and trim(r.project) <> ''
  and p.slug = trim(r.project);
