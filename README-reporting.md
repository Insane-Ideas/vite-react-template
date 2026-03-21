# E2E test reporting UI

Vite + React SPA that lists Playwright runs from Supabase and shows a nested step tree per test. Auth is Google OAuth via Supabase; the anon/publishable key is used in the browser with **Row Level Security** — do **not** ship the service role key to the client.

## Environment variables

Create `.env.local` (or `.env`) in the project root:

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Project URL from Supabase dashboard |
| `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Anon / publishable key (recommended name in this repo) |
| `VITE_SUPABASE_ANON_KEY` | Optional alias; used if `VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY` is unset |

Restart `npm run dev` after changing env files.

## Supabase tables

- `public.test_runs` — one row per run (`id`, `run_key`, `started_at`, `finished_at`, `status`, counts, `project`, `branch`, `commit_sha`, `trigger_source`, `meta`, …).
- `public.test_results` — one row per test (`run_id`, `file`, `title`, `full_title`, `status`, `duration_ms`, `retry`, `error_message`, `error_stack`, `steps` jsonb, `attachments` jsonb, …).

The UI queries only the columns documented in `src/lib/supabase/queries.ts`.

## RLS example (authenticated read-only)

Run in the Supabase SQL editor after creating tables. Tighten `USING` when you add org or role columns.

```sql
alter table public.test_runs enable row level security;
alter table public.test_results enable row level security;

-- Optional: revoke default public access if your project grants it
-- revoke all on public.test_runs from anon, authenticated;
-- grant select on public.test_runs to authenticated;
-- grant select on public.test_results to authenticated;

create policy "test_runs_select_authenticated"
  on public.test_runs
  for select
  to authenticated
  using (true);

create policy "test_results_select_authenticated"
  on public.test_results
  for select
  to authenticated
  using (true);
```

To allow **no** anonymous reads, ensure there is **no** `for select to anon` policy (or explicitly deny). The app sends the user JWT after sign-in so `authenticated` policies apply.

## Post-login consent

After Google sign-in, users must accept an in-app screen before the reporting shell loads. Acceptance is stored per user id in `localStorage` under `reporting_data_consent_v1:<user_id>`.

## OAuth consent route

`/oauth/consent` remains available for external OAuth-style consent flows (query params: `client_id`, `redirect_uri`, `scope`).
