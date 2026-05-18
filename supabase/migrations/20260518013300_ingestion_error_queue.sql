create table if not exists public.events (
  id text primary key,
  title text not null,
  description text not null check (char_length(description) >= 50),
  date timestamptz not null,
  date_time timestamptz,
  venue text,
  neighborhood text,
  address text not null,
  city text not null default 'Vancouver',
  image_url text not null,
  image_storage_path text,
  image_fallback_required boolean not null default false,
  tags text[] not null default '{}',
  category text,
  source text not null,
  source_url text,
  ticket_link text,
  url text,
  extraction_model text,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events
  add column if not exists date_time timestamptz,
  add column if not exists venue text,
  add column if not exists neighborhood text,
  add column if not exists image_storage_path text,
  add column if not exists image_fallback_required boolean not null default false,
  add column if not exists category text,
  add column if not exists source_url text,
  add column if not exists ticket_link text,
  add column if not exists extraction_model text,
  add column if not exists raw_payload jsonb;

update public.events
set
  date_time = coalesce(date_time, date),
  venue = coalesce(venue, address),
  source_url = coalesce(source_url, url),
  ticket_link = coalesce(ticket_link, url)
where date_time is null
   or venue is null
   or source_url is null
   or ticket_link is null;

alter table public.events
  alter column date_time set not null,
  alter column venue set not null;

create unique index if not exists events_source_url_unique_idx
  on public.events (source_url)
  where source_url is not null;

create unique index if not exists events_venue_date_time_unique_idx
  on public.events (venue, date_time);

create index if not exists events_date_time_idx
  on public.events (date_time asc);

create index if not exists events_neighborhood_idx
  on public.events (neighborhood);

create index if not exists events_category_idx
  on public.events (category);

create index if not exists events_venue_idx
  on public.events (venue);

create index if not exists events_tags_gin_idx
  on public.events using gin (tags);

create index if not exists events_source_idx
  on public.events (source);

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
