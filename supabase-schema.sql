-- ==============================================================================
-- FindMyDate - Supabase Database Schema
-- Run this script in the Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ==============================================================================

-- 1. Create 'participants' table
create table if not exists public.participants (
  id text primary key,
  created_at text not null default (now() at time zone 'utc')::text,
  answers jsonb not null default '{}'::jsonb
);

-- 2. Create 'matches' table
create table if not exists public.matches (
  id text primary key,
  a_id text not null,
  b_id text not null,
  score integer not null,
  reasons jsonb not null default '[]'::jsonb,
  status text not null default 'suggested',
  note text,
  date_at text,
  created_at text not null default (now() at time zone 'utc')::text,
  updated_at text not null default (now() at time zone 'utc')::text
);

-- 3. Helpful search indices for participant responses
create index if not exists idx_participants_phone on public.participants (((answers->>'phone')));
create index if not exists idx_participants_instagram on public.participants (((answers->>'instagram')));
create index if not exists idx_participants_city on public.participants (((answers->>'city')));
create index if not exists idx_matches_a_id on public.matches (a_id);
create index if not exists idx_matches_b_id on public.matches (b_id);
create index if not exists idx_matches_status on public.matches (status);

-- 4. Row Level Security (RLS) policies
-- Enable RLS
alter table public.participants enable row level security;
alter table public.matches enable row level security;

-- Drop any existing policies to allow re-running this script safely
drop policy if exists "Allow all operations for service and anon on participants" on public.participants;
drop policy if exists "Allow all operations for service and anon on matches" on public.matches;

-- Allow server operations (using service_role key or anon key)
create policy "Allow all operations for service and anon on participants"
  on public.participants
  for all
  using (true)
  with check (true);

create policy "Allow all operations for service and anon on matches"
  on public.matches
  for all
  using (true)
  with check (true);
