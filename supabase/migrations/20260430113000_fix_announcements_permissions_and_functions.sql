-- Enable Row Level Security (important if not already enabled)
alter table public.announcements enable row level security;

-- =========================
-- Admin Policy (Safe Create)
-- =========================
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'announcements'
      and policyname = 'admin_manage_announcements'
  ) then
    create policy admin_manage_announcements
    on public.announcements
    for all
    to authenticated
    using (
      exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role = 'admin'
      )
    )
    with check (
      exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role = 'admin'
      )
    );
  end if;
end
$$;

-- =========================
-- Shared Filter Logic (Optional but cleaner)
-- =========================
create or replace function public.get_active_announcements(p_type text)
returns table (
  id uuid,
  title text,
  message text,
  priority text,
  expiry_date timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    a.id,
    a.title,
    a.message,
    a.priority,
    a.expiry_date,
    a.created_at
  from public.announcements a
  where a.is_active = true
    and a.expiry_date > now()
    and a.announcement_type = p_type
  order by
    case a.priority
      when 'high' then 1
      when 'medium' then 2
      when 'low' then 3
      else 4
    end,
    a.created_at desc;
$$;

-- =========================
-- Bar Announcements
-- =========================
create or replace function public.get_bar_announcements()
returns table (
  id uuid,
  title text,
  message text,
  priority text,
  expiry_date timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select * from public.get_active_announcements('bar');
$$;

-- =========================
-- Dialog Announcements
-- =========================
create or replace function public.get_dialog_announcements()
returns table (
  id uuid,
  title text,
  message text,
  priority text,
  expiry_date timestamptz,
  created_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select * from public.get_active_announcements('dialog');
$$;