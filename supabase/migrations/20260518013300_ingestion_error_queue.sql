create table if not exists public.events (
  id text primary key,
  title text not null,
  description text not null check (char_length(description) >= 50),
  date timestamptz not null,
  address text not null,
  city text not null default 'Vancouver',
  image_url text not null,
  tags text[] not null default '{}',
  source text not null,
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.failed_ingestion_logs (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'unknown',
  target_url text,
  missing_properties text[] not null default '{}',
  title text,
  description text,
  image_url text,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists failed_ingestion_logs_created_at_idx
  on public.failed_ingestion_logs (created_at desc);

create index if not exists failed_ingestion_logs_source_idx
  on public.failed_ingestion_logs (source);

alter table public.failed_ingestion_logs enable row level security;

create policy "Service role can manage failed ingestion logs"
  on public.failed_ingestion_logs
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
