-- Upgrade para recursos editoriais, monetizacao, auditoria e publicacao.
-- Rode este arquivo no SQL Editor do Supabase depois do schema.sql.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('user', 'editor', 'admin', 'owner'));

alter table public.phones
  add column if not exists publication_status text not null default 'published' check (publication_status in ('draft', 'review', 'published', 'archived')),
  add column if not exists short_review text not null default '',
  add column if not exists recommended_for text not null default '',
  add column if not exists not_recommended_for text not null default '',
  add column if not exists alternatives text not null default '',
  add column if not exists min_historical_price numeric(12, 2) not null default 0,
  add column if not exists last_price_checked_at timestamptz,
  add column if not exists screen_size_in numeric(4, 2) not null default 0,
  add column if not exists brightness_nits integer not null default 0,
  add column if not exists camera_sensor text not null default '',
  add column if not exists has_ois boolean not null default false,
  add column if not exists optical_zoom text not null default '',
  add column if not exists update_promise text not null default '',
  add column if not exists biometric_type text not null default '',
  add column if not exists wireless_charging_w integer not null default 0,
  add column if not exists reverse_charging boolean not null default false,
  add column if not exists editorial_priority integer not null default 0;

alter table public.phone_prices
  add column if not exists coupon text not null default '',
  add column if not exists cashback text not null default '',
  add column if not exists in_stock boolean not null default true,
  add column if not exists trusted_store boolean not null default true,
  add column if not exists commission_note text not null default '';

create table if not exists public.phone_sources (
  id uuid primary key default gen_random_uuid(),
  phone_id uuid not null references public.phones(id) on delete cascade,
  title text not null,
  url text not null,
  source_type text not null default 'spec',
  created_at timestamptz not null default now()
);

create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  phone_id uuid references public.phones(id) on delete set null,
  offer_id uuid references public.phone_prices(id) on delete set null,
  store text not null default '',
  target_url text not null default '',
  referrer text not null default '',
  user_agent text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists phones_publication_status_idx on public.phones(publication_status);
create index if not exists phones_brand_price_idx on public.phones(brand, best_price);
create index if not exists phones_search_idx on public.phones using gin (to_tsvector('portuguese', name || ' ' || brand || ' ' || chipset));
create index if not exists phone_sources_phone_id_idx on public.phone_sources(phone_id);
create index if not exists affiliate_clicks_phone_id_idx on public.affiliate_clicks(phone_id);
create index if not exists affiliate_clicks_offer_id_idx on public.affiliate_clicks(offer_id);
create index if not exists admin_audit_logs_created_at_idx on public.admin_audit_logs(created_at desc);

alter table public.phone_sources enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.admin_audit_logs enable row level security;

drop policy if exists "sources are public read" on public.phone_sources;
create policy "sources are public read"
on public.phone_sources for select
to anon, authenticated
using (true);

-- Clicks e auditoria sao gravados pelo backend com service role.
-- Nao crie policies publicas de insert/update/delete para essas tabelas.
