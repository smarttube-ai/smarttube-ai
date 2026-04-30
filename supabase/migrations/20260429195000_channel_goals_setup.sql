-- Channel goals and badges tables used by dashboard goal tracking.
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create table if not exists public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null check (category in ('Content', 'Growth', 'Engagement', 'Monetization')),
  target_value integer not null check (target_value > 0),
  deadline date,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  status text not null default 'pending' check (status in ('pending', 'completed')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_user_goals_user_id on public.user_goals(user_id);
create index if not exists idx_user_goals_created_at on public.user_goals(created_at desc);

alter table public.user_goals enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_goals' and policyname = 'Users can view own goals'
  ) then
    create policy "Users can view own goals"
      on public.user_goals
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_goals' and policyname = 'Users can insert own goals'
  ) then
    create policy "Users can insert own goals"
      on public.user_goals
      for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_goals' and policyname = 'Users can update own goals'
  ) then
    create policy "Users can update own goals"
      on public.user_goals
      for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_goals' and policyname = 'Users can delete own goals'
  ) then
    create policy "Users can delete own goals"
      on public.user_goals
      for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end
$$;

create table if not exists public.user_badges (
  badge_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_name text not null,
  awarded_at timestamptz not null default now()
);

create index if not exists idx_user_badges_user_id on public.user_badges(user_id);

alter table public.user_badges enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'user_badges' and policyname = 'Users can view own badges'
  ) then
    create policy "Users can view own badges"
      on public.user_badges
      for select
      to authenticated
      using (auth.uid() = user_id);
  end if;
end
$$;
