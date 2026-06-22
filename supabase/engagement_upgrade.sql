-- Recursos de comunidade e historico inspirados em plataformas como Kimovil.
create extension if not exists pgcrypto;

create table if not exists price_alerts (
  id uuid primary key default gen_random_uuid(),
  phone_id uuid references phones(id) on delete cascade,
  contact text not null,
  target_price numeric(12,2) not null,
  channel text not null default 'email_whatsapp',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists user_phone_lists (
  id uuid primary key default gen_random_uuid(),
  phone_id uuid references phones(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  contact text not null default 'anonimo',
  status text not null check (status in ('want', 'have', 'had')),
  created_at timestamptz not null default now(),
  unique (phone_id, contact, status)
);

create table if not exists phone_reviews (
  id uuid primary key default gen_random_uuid(),
  phone_id uuid references phones(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  contact text not null default 'anonimo',
  rating numeric(3,1) not null check (rating >= 1 and rating <= 10),
  owned_status text not null default 'unknown',
  pros text not null default '',
  cons text not null default '',
  comment text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists price_history (
  id uuid primary key default gen_random_uuid(),
  phone_id uuid references phones(id) on delete cascade,
  store text not null,
  price numeric(12,2) not null,
  url text not null default '',
  captured_at timestamptz not null default now()
);

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  logo_url text not null default '',
  website_url text not null default '',
  trust_score numeric(3,1) not null default 0,
  coupon text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_price_alerts_phone_active on price_alerts(phone_id, active);
create index if not exists idx_user_phone_lists_phone_status on user_phone_lists(phone_id, status);
create index if not exists idx_phone_reviews_phone_created on phone_reviews(phone_id, created_at desc);
create index if not exists idx_price_history_phone_captured on price_history(phone_id, captured_at desc);

alter table price_alerts enable row level security;
alter table user_phone_lists enable row level security;
alter table phone_reviews enable row level security;
alter table price_history enable row level security;
alter table stores enable row level security;

drop policy if exists "Public can read phone reviews" on phone_reviews;
create policy "Public can read phone reviews" on phone_reviews for select using (true);

drop policy if exists "Public can read price history" on price_history;
create policy "Public can read price history" on price_history for select using (true);

drop policy if exists "Public can read stores" on stores;
create policy "Public can read stores" on stores for select using (true);

-- Inserts publicos continuam passando pelo backend com service role para validar e evitar spam direto no banco.
