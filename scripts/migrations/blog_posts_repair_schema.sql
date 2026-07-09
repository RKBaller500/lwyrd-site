-- ============================================================
--  LWYRD blog CMS — repair existing blog_posts table
--
--  Use this for projects where public.blog_posts already existed before the
--  full CMS schema was introduced. The original blog_posts.sql uses
--  `create table if not exists`, which will not add newly introduced columns
--  to an existing table. Missing columns show up in Supabase/PostgREST as:
--  "Could not find the 'author_name' column of 'blog_posts' in the schema cache."
--
--  Safe to run multiple times.
-- ============================================================

alter table public.blog_posts
  add column if not exists description text not null default '',
  add column if not exists content text not null default '',
  add column if not exists author_name text not null default 'LWYRD Editorial',
  add column if not exists author_title text,
  add column if not exists category text not null default 'news',
  add column if not exists business_types text[] not null default '{}',
  add column if not exists business_focus text[] not null default '{}',
  add column if not exists is_editors_pick boolean not null default false,
  add column if not exists is_weekly_intake boolean not null default false,
  add column if not exists read_time_minutes integer not null default 0,
  add column if not exists thumbnail_accent text not null default '#002452',
  add column if not exists thumbnail_image text,
  add column if not exists status text not null default 'draft',
  add column if not exists published_at timestamptz,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table public.blog_posts
  alter column description set default '',
  alter column content set default '',
  alter column author_name set default 'LWYRD Editorial',
  alter column category set default 'news',
  alter column business_types set default '{}',
  alter column business_focus set default '{}',
  alter column is_editors_pick set default false,
  alter column is_weekly_intake set default false,
  alter column read_time_minutes set default 0,
  alter column thumbnail_accent set default '#002452',
  alter column status set default 'draft',
  alter column created_at set default now(),
  alter column updated_at set default now();

update public.blog_posts
set
  description = coalesce(description, ''),
  content = coalesce(content, ''),
  author_name = coalesce(nullif(author_name, ''), 'LWYRD Editorial'),
  category = case
    when category in ('news', 'advice', 'general') then category
    else 'news'
  end,
  business_types = coalesce(business_types, '{}'),
  business_focus = coalesce(business_focus, '{}'),
  is_editors_pick = coalesce(is_editors_pick, false),
  is_weekly_intake = coalesce(is_weekly_intake, false),
  read_time_minutes = coalesce(read_time_minutes, 0),
  thumbnail_accent = coalesce(nullif(thumbnail_accent, ''), '#002452'),
  status = case
    when status in ('draft', 'published') then status
    else 'draft'
  end,
  created_at = coalesce(created_at, now()),
  updated_at = coalesce(updated_at, now());

alter table public.blog_posts
  alter column description set not null,
  alter column content set not null,
  alter column author_name set not null,
  alter column category set not null,
  alter column business_types set not null,
  alter column business_focus set not null,
  alter column is_editors_pick set not null,
  alter column is_weekly_intake set not null,
  alter column read_time_minutes set not null,
  alter column thumbnail_accent set not null,
  alter column status set not null,
  alter column created_at set not null,
  alter column updated_at set not null;

alter table public.blog_posts
  drop constraint if exists blog_posts_category_check;

alter table public.blog_posts
  add constraint blog_posts_category_check
  check (category in ('news', 'advice', 'general'));

alter table public.blog_posts
  drop constraint if exists blog_posts_status_check;

alter table public.blog_posts
  add constraint blog_posts_status_check
  check (status in ('draft', 'published'));

create unique index if not exists blog_posts_slug_unique_idx
  on public.blog_posts (slug);

create index if not exists blog_posts_status_published_at_idx
  on public.blog_posts (status, published_at desc);

create index if not exists blog_posts_slug_idx
  on public.blog_posts (slug);

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

alter table public.blog_posts enable row level security;

drop policy if exists "Published blog posts are publicly readable" on public.blog_posts;
create policy "Published blog posts are publicly readable"
  on public.blog_posts
  for select
  using (status = 'published');

notify pgrst, 'reload schema';
