-- Hospitrend — database schema (Démo 1)
-- Paste this whole file into Supabase > SQL Editor > New query, then click "Run".
-- It can be run again safely: every statement is idempotent.

-- ---------------------------------------------------------------------------
-- Sources
-- ---------------------------------------------------------------------------
create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  site_url text not null,
  feed_url text,
  google_news_query text,
  language text not null check (language in ('fr', 'en', 'es')),
  reliability smallint not null default 2 check (reliability between 1 and 3),
  priority smallint not null default 2,
  default_theme text not null,
  active boolean not null default true,
  last_success_at timestamptz,
  last_via text,
  last_error text,
  last_error_at timestamptz,
  consecutive_failures integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Articles
-- ---------------------------------------------------------------------------
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources (id) on delete cascade,
  url text not null unique,
  title text not null,
  title_fingerprint text not null,
  excerpt text not null default '',
  image_url text,
  language text not null check (language in ('fr', 'en', 'es')),
  published_at timestamptz not null,
  fetched_at timestamptz not null default now(),
  main_theme text not null,
  secondary_themes text[] not null default '{}',
  tags text[] not null default '{}',
  -- Filled by the daily Claude routine (Démo 2). Until then the card shows the excerpt.
  summary_status text not null default 'pending' check (summary_status in ('pending', 'done', 'ignored')),
  summary_short text,
  summary_points text[],
  hotel_impact text
);

create index if not exists articles_published_at_idx on public.articles (published_at desc);
create index if not exists articles_fingerprint_idx on public.articles (title_fingerprint, published_at);

-- ---------------------------------------------------------------------------
-- Interactions (like, dislike, open, save, unsave) and saved articles
-- ---------------------------------------------------------------------------
create table if not exists public.interactions (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Nullable: when an old article is purged, the choice is kept (with its themes) for learning and usage stats.
  article_id uuid references public.articles (id) on delete set null,
  type text not null check (type in ('like', 'dislike', 'open', 'save', 'unsave')),
  main_theme text,
  secondary_themes text[],
  tags text[],
  after_open boolean not null default false,
  duration_ms integer,
  undone boolean not null default false,
  created_at timestamptz not null default now()
);

-- Upgrade of a database created with an earlier version of this file.
alter table public.interactions alter column article_id drop not null;
alter table public.interactions add column if not exists main_theme text;
alter table public.interactions add column if not exists secondary_themes text[];
alter table public.interactions add column if not exists tags text[];
alter table public.interactions drop constraint if exists interactions_article_id_fkey;
alter table public.interactions add constraint interactions_article_id_fkey
  foreign key (article_id) references public.articles (id) on delete set null;

create index if not exists interactions_user_idx on public.interactions (user_id, created_at desc);
create index if not exists interactions_article_idx on public.interactions (article_id);

-- Copies the article's themes and tags into each interaction, so they survive the purge.
create or replace function public.interactions_copy_themes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select a.main_theme, a.secondary_themes, a.tags
    into new.main_theme, new.secondary_themes, new.tags
  from public.articles a
  where a.id = new.article_id;
  return new;
end;
$$;

revoke all on function public.interactions_copy_themes() from public, anon, authenticated;

-- Fills the themes of interactions recorded before this column existed.
update public.interactions i
set main_theme = a.main_theme, secondary_themes = a.secondary_themes, tags = a.tags
from public.articles a
where a.id = i.article_id and i.main_theme is null;

drop trigger if exists interactions_copy_themes on public.interactions;
create trigger interactions_copy_themes
  before insert on public.interactions
  for each row execute function public.interactions_copy_themes();

create table if not exists public.saved_articles (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  article_id uuid not null references public.articles (id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

-- ---------------------------------------------------------------------------
-- Allowed accounts (SPEC US-01 CA2/CA3), enforced by the database itself.
-- Kept in sync with the ALLOWED_EMAILS and ADMIN_EMAILS variables by the app
-- (at each allowed sign-in and at each daily collection): never edit it by hand.
-- An account created outside the app (for example through the Supabase API)
-- is not in this table, so it can read and write nothing.
-- ---------------------------------------------------------------------------
create table if not exists public.allowed_emails (
  email text primary key check (email = lower(email)),
  created_at timestamptz not null default now()
);

create or replace function public.is_allowed()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.allowed_emails e
    where e.email = lower(coalesce((select auth.jwt()) ->> 'email', ''))
  );
$$;

revoke all on function public.is_allowed() from public, anon;
grant execute on function public.is_allowed() to authenticated;

-- ---------------------------------------------------------------------------
-- Ingestion log
-- ---------------------------------------------------------------------------
create table if not exists public.ingest_runs (
  id bigint generated always as identity primary key,
  started_at timestamptz not null,
  finished_at timestamptz not null,
  inserted integer not null,
  purged integer not null,
  report jsonb not null
);

-- ---------------------------------------------------------------------------
-- Row Level Security: only allowed accounts get in, and each one only sees
-- her own interactions and saves. Ingestion uses the secret key on the server,
-- which bypasses RLS.
-- ---------------------------------------------------------------------------
alter table public.sources enable row level security;
alter table public.articles enable row level security;
alter table public.interactions enable row level security;
alter table public.saved_articles enable row level security;
alter table public.ingest_runs enable row level security;
alter table public.allowed_emails enable row level security;

drop policy if exists "sources readable by signed-in users" on public.sources;
create policy "sources readable by signed-in users" on public.sources
  for select to authenticated using ((select public.is_allowed()));

drop policy if exists "articles readable by signed-in users" on public.articles;
create policy "articles readable by signed-in users" on public.articles
  for select to authenticated using ((select public.is_allowed()));

drop policy if exists "own interactions" on public.interactions;
create policy "own interactions" on public.interactions
  for all to authenticated
  using (user_id = (select auth.uid()) and (select public.is_allowed()))
  with check (user_id = (select auth.uid()) and (select public.is_allowed()));

drop policy if exists "own saved articles" on public.saved_articles;
create policy "own saved articles" on public.saved_articles
  for all to authenticated
  using (user_id = (select auth.uid()) and (select public.is_allowed()))
  with check (user_id = (select auth.uid()) and (select public.is_allowed()));

-- ---------------------------------------------------------------------------
-- Daily feed (Démo 1): recent articles not yet liked or disliked,
-- newest first, alternating sources so one outlet does not fill the feed.
-- Personalised scoring arrives in Démo 2 (US-10, US-11).
-- ---------------------------------------------------------------------------
create or replace function public.get_feed(p_limit integer default 25)
returns setof public.articles
language sql
stable
security invoker
set search_path = public
as $$
  with candidates as (
    select a.*,
           row_number() over (partition by a.source_id order by a.published_at desc) as rank_in_source
    from public.articles a
    where a.published_at >= now() - interval '7 days'
      and a.summary_status <> 'ignored'
      and not exists (
        select 1 from public.interactions i
        where i.article_id = a.id
          and i.user_id = (select auth.uid())
          and i.type in ('like', 'dislike')
          and not i.undone
      )
  )
  select id, source_id, url, title, title_fingerprint, excerpt, image_url, language,
         published_at, fetched_at, main_theme, secondary_themes, tags,
         summary_status, summary_short, summary_points, hotel_impact
  from candidates
  order by rank_in_source, published_at desc
  limit greatest(0, least(p_limit, 100));
$$;

-- Removes articles older than 30 days that nobody saved (SPEC US-19 CA7).
create or replace function public.purge_old_articles()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  n integer;
begin
  delete from public.articles a
  where a.fetched_at < now() - interval '30 days'
    and not exists (select 1 from public.saved_articles s where s.article_id = a.id);
  get diagnostics n = row_count;
  return n;
end;
$$;

revoke all on function public.purge_old_articles() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Explicit grants (in case the project does not grant them by default).
-- ---------------------------------------------------------------------------
grant usage on schema public to authenticated, service_role;
grant select on public.sources, public.articles to authenticated;
grant select, insert, update, delete on public.interactions, public.saved_articles to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
grant execute on function public.get_feed(integer) to authenticated;
grant execute on function public.purge_old_articles() to service_role;
