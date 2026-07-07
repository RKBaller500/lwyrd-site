-- Account-backed paywall state for per-intake unlocks and bundle credits.
-- Stripe webhooks should write to these same tables once payments are live.

create table if not exists public.intake_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  intake_submission_id uuid not null references public.intake_submissions(id) on delete cascade,
  source text not null default 'stripe' check (source in ('stripe', 'preview', 'credit')),
  purchase_tier text null check (purchase_tier in ('single', 'bundle_3', 'bundle_5')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, intake_submission_id)
);

create index if not exists intake_unlocks_user_id_idx
  on public.intake_unlocks(user_id);

create index if not exists intake_unlocks_intake_submission_id_idx
  on public.intake_unlocks(intake_submission_id);

create table if not exists public.unlock_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  intake_submission_id uuid null references public.intake_submissions(id) on delete set null,
  delta integer not null,
  reason text not null,
  source text not null default 'stripe' check (source in ('stripe', 'preview', 'credit')),
  tier text null check (tier in ('single', 'bundle_3', 'bundle_5')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists unlock_credit_ledger_user_id_idx
  on public.unlock_credit_ledger(user_id);

create index if not exists unlock_credit_ledger_intake_submission_id_idx
  on public.unlock_credit_ledger(intake_submission_id);

alter table public.intake_unlocks enable row level security;
alter table public.unlock_credit_ledger enable row level security;

drop policy if exists "Users can read own intake unlocks" on public.intake_unlocks;
create policy "Users can read own intake unlocks"
  on public.intake_unlocks
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can read own unlock ledger" on public.unlock_credit_ledger;
create policy "Users can read own unlock ledger"
  on public.unlock_credit_ledger
  for select
  using (auth.uid() = user_id);

-- No authenticated insert/update/delete policies are created intentionally.
-- Server-side purchase/preview endpoints and future Stripe webhooks should write
-- with the service role after verifying the authenticated user or payment event.
