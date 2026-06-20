create extension if not exists "pgcrypto";

create table if not exists public.phones (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand text not null default '',
  image_url text not null default '',
  launch_status text not null default 'available' check (launch_status in ('available', 'new', 'rumor')),
  release_date date not null default now(),
  price numeric(12, 2) not null default 0,
  best_price numeric(12, 2) not null default 0,
  affiliate_url text not null default '',
  chipset text not null default '',
  ram_gb integer not null default 0,
  storage_gb integer not null default 0,
  display text not null default '',
  display_hz integer not null default 0,
  battery_mah integer not null default 0,
  charging_w integer not null default 0,
  main_camera_mp integer not null default 0,
  video text not null default '',
  os text not null default '',
  antutu_score integer not null default 0,
  antutu_version text not null default '',
  height_mm numeric(8, 2) not null default 0,
  width_mm numeric(8, 2) not null default 0,
  thickness_mm numeric(8, 2) not null default 0,
  weight_g integer not null default 0,
  water_resistance text not null default '',
  score_performance numeric(3, 1) not null default 0 check (score_performance >= 0 and score_performance <= 10),
  score_camera numeric(3, 1) not null default 0 check (score_camera >= 0 and score_camera <= 10),
  score_battery numeric(3, 1) not null default 0 check (score_battery >= 0 and score_battery <= 10),
  score_display numeric(3, 1) not null default 0 check (score_display >= 0 and score_display <= 10),
  score_build numeric(3, 1) not null default 0 check (score_build >= 0 and score_build <= 10),
  score_value numeric(3, 1) not null default 0 check (score_value >= 0 and score_value <= 10),
  verdict text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.phone_prices (
  id uuid primary key default gen_random_uuid(),
  phone_id uuid not null references public.phones(id) on delete cascade,
  store text not null,
  price numeric(12, 2) not null,
  url text not null,
  updated_at timestamptz not null default now()
);

create index if not exists phones_slug_idx on public.phones(slug);
create index if not exists phones_brand_idx on public.phones(brand);
create index if not exists phones_best_price_idx on public.phones(best_price);
create index if not exists phones_score_value_idx on public.phones(score_value desc);
create index if not exists phone_prices_phone_id_idx on public.phone_prices(phone_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists phones_set_updated_at on public.phones;
create trigger phones_set_updated_at
before update on public.phones
for each row
execute function public.set_updated_at();

alter table public.phones enable row level security;
alter table public.phone_prices enable row level security;

drop policy if exists "phones are public read" on public.phones;
create policy "phones are public read"
on public.phones for select
to anon, authenticated
using (true);

drop policy if exists "prices are public read" on public.phone_prices;
create policy "prices are public read"
on public.phone_prices for select
to anon, authenticated
using (true);

-- Escrita deve acontecer pelo backend usando SUPABASE_SERVICE_ROLE_KEY.
-- Nao crie politica publica de insert/update para o painel admin.
