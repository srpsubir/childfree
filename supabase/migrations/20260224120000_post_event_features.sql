-- safety_reports: one report per (reporter, reported_user, event)
create table if not exists public.safety_reports (
  id             uuid primary key default gen_random_uuid(),
  reporter_id    uuid not null,
  reported_user_id uuid not null,
  event_id       uuid references public.events(id),
  category       text not null check (category in ('harassment', 'misrepresentation', 'boundary_violation', 'other')),
  description    text,
  status         text not null default 'pending',
  created_at     timestamptz not null default now(),
  unique (reporter_id, reported_user_id, event_id)
);

alter table public.safety_reports enable row level security;

-- Users may insert their own reports
create policy "safety_reports_insert_own"
  on public.safety_reports for insert
  with check (auth.uid() = reporter_id);

-- Users may select their own reports; admins may select all
create policy "safety_reports_select"
  on public.safety_reports for select
  using (
    auth.uid() = reporter_id
    or has_role(auth.uid(), 'admin')
  );

-- Only admins may update
create policy "safety_reports_update_admin"
  on public.safety_reports for update
  using (has_role(auth.uid(), 'admin'));

-- Nobody may delete
-- (no delete policy → delete is denied for all)


-- connect_requests: one request per (requester, target, event)
create table if not exists public.connect_requests (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null,
  target_id    uuid not null,
  event_id     uuid references public.events(id),
  created_at   timestamptz not null default now(),
  unique (requester_id, target_id, event_id)
);

alter table public.connect_requests enable row level security;

-- Users may insert their own requests
create policy "connect_requests_insert_own"
  on public.connect_requests for insert
  with check (auth.uid() = requester_id);

-- Requester, target, and admins may select
create policy "connect_requests_select"
  on public.connect_requests for select
  using (
    auth.uid() = requester_id
    or auth.uid() = target_id
    or has_role(auth.uid(), 'admin')
  );

-- No update or delete policies → denied for all non-admins
