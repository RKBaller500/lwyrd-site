-- Allow a third blog category, 'general', for posts that don't fit News or
-- Advice. Run this in the Supabase SQL editor if you already applied
-- blog_posts.sql before this option existed. (New installs of blog_posts.sql
-- already include 'general'.)

alter table public.blog_posts
  drop constraint if exists blog_posts_category_check;

alter table public.blog_posts
  add constraint blog_posts_category_check
  check (category in ('news', 'advice', 'general'));
