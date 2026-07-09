-- ============================================================
--  LWYRD blog CMS — uploaded cover image storage
--
--  Run this in the Supabase SQL editor before using the admin image uploader.
--  The admin server action uploads with the service role after verifyAdmin().
--  Objects are public so blog cards and post pages can render cover images.
--
--  Safe to run multiple times.
-- ============================================================

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'blog-images',
  'blog-images',
  true,
  8388608,
  array[
    'image/avif',
    'image/gif',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Blog images are publicly readable'
  ) then
    create policy "Blog images are publicly readable"
      on storage.objects
      for select
      to public
      using (bucket_id = 'blog-images');
  end if;
end $$;
