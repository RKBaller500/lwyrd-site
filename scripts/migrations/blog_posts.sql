-- ============================================================
--  LWYRD blog CMS — blog_posts table
--  Run this once in the Supabase dashboard SQL editor.
--  Public visitors can read PUBLISHED posts only. All writes go
--  through admin server actions using the service-role client,
--  which bypasses RLS — so no authenticated write policies exist.
-- ============================================================

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null default '',
  content text not null default '',
  author_name text not null default 'LWYRD Editorial',
  author_title text,
  category text not null default 'news' check (category in ('news', 'advice', 'general')),
  business_types text[] not null default '{}',
  business_focus text[] not null default '{}',
  is_editors_pick boolean not null default false,
  is_weekly_intake boolean not null default false,
  read_time_minutes integer not null default 0,
  thumbnail_accent text not null default '#002452',
  thumbnail_image text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_status_published_at_idx
  on public.blog_posts (status, published_at desc);

create index if not exists blog_posts_slug_idx
  on public.blog_posts (slug);

-- Keep updated_at fresh on every write.
create or replace function public.set_blog_posts_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists blog_posts_set_updated_at on public.blog_posts;
create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_blog_posts_updated_at();

-- Row Level Security --------------------------------------------------------
alter table public.blog_posts enable row level security;

drop policy if exists "Published blog posts are publicly readable" on public.blog_posts;
create policy "Published blog posts are publicly readable"
  on public.blog_posts
  for select
  using (status = 'published');

-- No insert/update/delete policies are defined intentionally.
-- Admin server actions write with the service role after verifyAdmin().
