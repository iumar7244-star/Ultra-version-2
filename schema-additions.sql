-- ============================================================================
-- جسر الوصول — additive SQL for PDF uploads
-- This does NOT touch your existing schools/topics/questions/etc tables.
-- Run once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run (everything is IF NOT EXISTS / ON CONFLICT DO NOTHING).
-- ============================================================================

create extension if not exists pgcrypto;

-- 1. Table to hold PDF metadata (the file itself lives in Storage).
create table if not exists public.pdf_resources (
  id            uuid primary key default gen_random_uuid(),
  school_id     uuid references public.schools(id) on delete cascade not null,
  topic_id      uuid references public.topics(id) on delete set null,
  subject       text,
  title         text not null,
  storage_path  text not null,
  uploaded_at   timestamptz default now()
);

alter table public.pdf_resources enable row level security;

-- Anyone can read the list (students browse PDFs without logging in).
drop policy if exists "pdf_resources_select_public" on public.pdf_resources;
create policy "pdf_resources_select_public" on public.pdf_resources
  for select using (true);

-- Only a school's own logged-in admin can add/remove its rows.
-- Uses the school_members table your existing setup already has.
drop policy if exists "pdf_resources_write_admin" on public.pdf_resources;
create policy "pdf_resources_write_admin" on public.pdf_resources
  for all using (
    exists (
      select 1 from public.school_members
      where school_members.school_id = pdf_resources.school_id
        and school_members.user_id = auth.uid()
        and school_members.status = 'active'
    )
  ) with check (
    exists (
      select 1 from public.school_members
      where school_members.school_id = pdf_resources.school_id
        and school_members.user_id = auth.uid()
        and school_members.status = 'active'
    )
  );

-- 2. Storage bucket for the actual PDF files.
insert into storage.buckets (id, name, public)
values ('pdfs', 'pdfs', true)
on conflict (id) do nothing;

-- Anyone can download (public bucket); only a school's own admin can
-- upload/delete inside their own school_id-prefixed folder.
drop policy if exists "pdfs_storage_read_public" on storage.objects;
create policy "pdfs_storage_read_public" on storage.objects
  for select using (bucket_id = 'pdfs');

drop policy if exists "pdfs_storage_write_admin" on storage.objects;
create policy "pdfs_storage_write_admin" on storage.objects
  for insert with check (
    bucket_id = 'pdfs'
    and exists (
      select 1 from public.school_members
      where school_members.school_id = ((storage.foldername(name))[1])::uuid
        and school_members.user_id = auth.uid()
        and school_members.status = 'active'
    )
  );

drop policy if exists "pdfs_storage_delete_admin" on storage.objects;
create policy "pdfs_storage_delete_admin" on storage.objects
  for delete using (
    bucket_id = 'pdfs'
    and exists (
      select 1 from public.school_members
      where school_members.school_id = ((storage.foldername(name))[1])::uuid
        and school_members.user_id = auth.uid()
        and school_members.status = 'active'
    )
  );

-- ============================================================================
-- Also needed for the public quiz/PDF pages to work without login: make sure
-- terms / topics / term_topics / questions already allow public SELECT.
-- If you're not sure they do, these are safe to (re-)run:
-- ============================================================================
alter table public.terms       enable row level security;
alter table public.topics      enable row level security;
alter table public.term_topics enable row level security;
alter table public.questions   enable row level security;

drop policy if exists "terms_select_public" on public.terms;
create policy "terms_select_public" on public.terms for select using (true);

drop policy if exists "topics_select_public" on public.topics;
create policy "topics_select_public" on public.topics for select using (true);

drop policy if exists "term_topics_select_public" on public.term_topics;
create policy "term_topics_select_public" on public.term_topics for select using (true);

drop policy if exists "questions_select_public" on public.questions;
create policy "questions_select_public" on public.questions for select using (true);

-- ============================================================================
-- Platform accounts + owner Admin control panel
-- ============================================================================
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table public.profiles enable row level security;

drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles for select using (auth.uid() = user_id);

drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create or replace function public.sync_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(user_id,name,email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'), new.email)
  on conflict (user_id) do update set
    name = coalesce(excluded.name, profiles.name),
    email = excluded.email,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_profile on auth.users;
create trigger on_auth_user_profile after insert or update of email, raw_user_meta_data on auth.users
for each row execute function public.sync_profile();

insert into public.profiles(user_id,name,email)
select id, coalesce(raw_user_meta_data->>'name', raw_user_meta_data->>'full_name'), email from auth.users
on conflict (user_id) do update set email=excluded.email, name=coalesce(excluded.name,profiles.name);

create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Admin',
  created_at timestamptz default now()
);
alter table public.platform_admins enable row level security;

drop policy if exists "platform_admins_self_read" on public.platform_admins;
create policy "platform_admins_self_read" on public.platform_admins for select using (auth.uid() = user_id);

create or replace function public.is_platform_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.platform_admins where user_id = auth.uid());
$$;

-- Admins can read and manage the platform's cloud data. These policies are additive.
do $$ begin
  if to_regclass('public.schools') is not null then
    execute 'drop policy if exists "platform_admin_all_schools" on public.schools';
    execute 'create policy "platform_admin_all_schools" on public.schools for all using (public.is_platform_admin()) with check (public.is_platform_admin())';
  end if;
  if to_regclass('public.school_members') is not null then
    execute 'drop policy if exists "platform_admin_all_school_members" on public.school_members';
    execute 'create policy "platform_admin_all_school_members" on public.school_members for all using (public.is_platform_admin()) with check (public.is_platform_admin())';
  end if;
  if to_regclass('public.terms') is not null then
    execute 'drop policy if exists "platform_admin_all_terms" on public.terms';
    execute 'create policy "platform_admin_all_terms" on public.terms for all using (public.is_platform_admin()) with check (public.is_platform_admin())';
  end if;
  if to_regclass('public.topics') is not null then
    execute 'drop policy if exists "platform_admin_all_topics" on public.topics';
    execute 'create policy "platform_admin_all_topics" on public.topics for all using (public.is_platform_admin()) with check (public.is_platform_admin())';
  end if;
  if to_regclass('public.term_topics') is not null then
    execute 'drop policy if exists "platform_admin_all_term_topics" on public.term_topics';
    execute 'create policy "platform_admin_all_term_topics" on public.term_topics for all using (public.is_platform_admin()) with check (public.is_platform_admin())';
  end if;
  if to_regclass('public.questions') is not null then
    execute 'drop policy if exists "platform_admin_all_questions" on public.questions';
    execute 'create policy "platform_admin_all_questions" on public.questions for all using (public.is_platform_admin()) with check (public.is_platform_admin())';
  end if;
  if to_regclass('public.pdf_resources') is not null then
    execute 'drop policy if exists "platform_admin_all_pdfs" on public.pdf_resources';
    execute 'create policy "platform_admin_all_pdfs" on public.pdf_resources for all using (public.is_platform_admin()) with check (public.is_platform_admin())';
  end if;
end $$;

create or replace function public.admin_overview()
returns json language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then raise exception 'Admin access required'; end if;
  return json_build_object(
    'users',(select count(*) from public.profiles),
    'schools',(select count(*) from public.schools),
    'questions',(select count(*) from public.questions),
    'pdfs',(select count(*) from public.pdf_resources)
  );
end;
$$;

create or replace function public.admin_registered_users()
returns table(user_id uuid, name text, email text, created_at timestamptz) language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then raise exception 'Admin access required'; end if;
  return query select p.user_id,p.name,p.email,p.created_at from public.profiles p order by p.created_at desc;
end;
$$;

create or replace function public.admin_schools()
returns table(id uuid,name text,address text,phone text,email text,created_at timestamptz) language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then raise exception 'Admin access required'; end if;
  return query select s.id,s.name,s.address,s.phone,s.email,s.created_at from public.schools s order by s.created_at desc;
end;
$$;

create or replace function public.admin_pdfs()
returns table(id uuid,school_id uuid,title text,subject text,storage_path text,uploaded_at timestamptz) language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then raise exception 'Admin access required'; end if;
  return query select p.id,p.school_id,p.title,p.subject,p.storage_path,p.uploaded_at from public.pdf_resources p order by p.uploaded_at desc;
end;
$$;

create or replace function public.admin_delete_pdf(p_id uuid,p_storage_path text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if not public.is_platform_admin() then raise exception 'Admin access required'; end if;
  delete from public.pdf_resources where id=p_id;
  return true;
end;
$$;

-- One-time owner account mapping.
-- First create this Auth user in Supabase Authentication:
--   email: admin@jisralwusool.local
--   password: Assalaamalaikum
-- Then run this statement once:
insert into public.platform_admins(user_id,display_name)
select id,'Admin' from auth.users
where email='admin@jisralwusool.local'
on conflict (user_id) do update set display_name='Admin';

-- Platform Admin may also upload/delete public PDFs for any school.
drop policy if exists "platform_admin_pdfs_storage_insert" on storage.objects;
create policy "platform_admin_pdfs_storage_insert" on storage.objects
for insert with check (bucket_id='pdfs' and public.is_platform_admin());

drop policy if exists "platform_admin_pdfs_storage_delete" on storage.objects;
create policy "platform_admin_pdfs_storage_delete" on storage.objects
for delete using (bucket_id='pdfs' and public.is_platform_admin());
