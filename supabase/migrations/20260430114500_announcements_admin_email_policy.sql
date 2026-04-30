-- Enable RLS (safe to run even if already enabled)
alter table public.announcements enable row level security;

-- =====================================
-- Helper: Check if current user is admin
-- =====================================
create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
    )
    or lower(coalesce(auth.jwt() ->> 'email', '')) in (
      'mbasam313@gmail.com',
      'hello.smarttubeai@gmail.com'
    );
$$;

-- =====================================
-- Recreate Policy Cleanly
-- =====================================
drop policy if exists admin_manage_announcements on public.announcements;

create policy admin_manage_announcements
on public.announcements
for all
to authenticated
using (public.is_admin_user())
with check (public.is_admin_user());