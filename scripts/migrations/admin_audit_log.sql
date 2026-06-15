-- Run this in the Supabase SQL editor to create the admin audit log table.
-- Each state-changing admin action (create/update/delete) inserts a row here.

create table if not exists admin_audit_log (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid not null references auth.users(id) on delete set null,
  action      text not null,          -- e.g. 'create_firm', 'delete_user'
  target_type text not null,          -- e.g. 'firm', 'user', 'category'
  target_id   text,                   -- the id/slug of the affected record
  before      jsonb,                  -- snapshot before change (null for creates)
  after       jsonb,                  -- snapshot after change (null for deletes)
  created_at  timestamptz not null default now()
);

-- Admins can insert; nobody can update or delete audit rows.
alter table admin_audit_log enable row level security;

create policy "admins can insert audit logs"
  on admin_audit_log for insert
  to authenticated
  with check (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.is_admin = true
    )
  );

-- Read access restricted to admins only.
create policy "admins can read audit logs"
  on admin_audit_log for select
  to authenticated
  using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
        and profiles.is_admin = true
    )
  );

-- Index for common query patterns
create index if not exists admin_audit_log_actor_idx    on admin_audit_log(actor_id);
create index if not exists admin_audit_log_action_idx   on admin_audit_log(action);
create index if not exists admin_audit_log_created_idx  on admin_audit_log(created_at desc);
