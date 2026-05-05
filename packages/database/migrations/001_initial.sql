-- FinEngine OSS — Supabase Initial Migration
-- Run this SQL in your Supabase SQL Editor (https://app.supabase.com → SQL Editor)
--
-- After running, copy your SUPABASE_URL and SUPABASE_ANON_KEY from:
--   Supabase Dashboard → Project Settings → API

-- ─── Extensions ──────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Tables ──────────────────────────────────────────────────────────────────

-- Stores all imported financial transactions
create table if not exists public.transactions (
  id            text primary key,
  date          text not null,
  description   text not null,
  amount        numeric(12, 2) not null,
  type          text not null check (type in ('credit', 'debit')),
  category      text,
  account       text,
  source        text not null default 'manual'
                  check (source in ('csv', 'pluggy', 'mock', 'manual')),
  session_id    uuid,
  metadata      jsonb,
  created_at    timestamptz not null default now()
);

-- Stores each analysis run (summary + full result)
create table if not exists public.analysis_sessions (
  id                uuid primary key default uuid_generate_v4(),
  source_connector  text not null,
  period_from       text not null,
  period_to         text not null,
  total_income      numeric(12, 2) not null,
  total_expenses    numeric(12, 2) not null,
  balance           numeric(12, 2) not null,
  savings_rate      numeric(6, 4) not null,
  transaction_count int not null,
  result_json       jsonb,
  created_at        timestamptz not null default now()
);

-- Stores individual AI/rule-based insights linked to a session
create table if not exists public.insights (
  id          text primary key,
  session_id  uuid references public.analysis_sessions(id) on delete cascade,
  level       text not null check (level in ('info', 'success', 'warning', 'danger')),
  message     text not null,
  detail      text,
  category    text,
  value       numeric,
  change_pct  numeric,
  created_at  timestamptz not null default now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists idx_transactions_date        on public.transactions(date);
create index if not exists idx_transactions_category    on public.transactions(category);
create index if not exists idx_transactions_session     on public.transactions(session_id);
create index if not exists idx_analysis_sessions_date  on public.analysis_sessions(created_at desc);
create index if not exists idx_insights_session        on public.insights(session_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- This tool runs locally as a single user.
-- These permissive policies allow the anon key to read/write all rows.
-- For a multi-user SaaS: replace with auth.uid()-based policies.

alter table public.transactions       enable row level security;
alter table public.analysis_sessions  enable row level security;
alter table public.insights           enable row level security;

create policy "anon_all_transactions"
  on public.transactions for all
  using (true)
  with check (true);

create policy "anon_all_analysis_sessions"
  on public.analysis_sessions for all
  using (true)
  with check (true);

create policy "anon_all_insights"
  on public.insights for all
  using (true)
  with check (true);

-- ─── Helper views ─────────────────────────────────────────────────────────────

-- Quick summary of spending by category across all sessions
create or replace view public.spending_by_category as
  select
    category,
    sum(abs(amount))  as total,
    count(*)          as count,
    min(date)         as first_date,
    max(date)         as last_date
  from public.transactions
  where type = 'debit' and category is not null
  group by category
  order by total desc;

-- Recent analysis sessions with key metrics
create or replace view public.recent_sessions as
  select
    id,
    source_connector,
    period_from,
    period_to,
    total_income,
    total_expenses,
    balance,
    round(savings_rate * 100, 1) as savings_rate_pct,
    transaction_count,
    created_at
  from public.analysis_sessions
  order by created_at desc
  limit 20;
