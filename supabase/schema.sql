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

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  full_name text not null default '',
  phone text not null default '',
  city text not null default '',
  state text not null default '',
  budget_min numeric(12, 2) not null default 0,
  budget_max numeric(12, 2) not null default 0,
  preferred_brands text[] not null default '{}',
  wants_offers boolean not null default true,
  created_at timestamptz not null default now(),
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

create or replace function public.is_admin(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = user_id
      and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    role,
    full_name,
    phone,
    city,
    state,
    budget_min,
    budget_max,
    preferred_brands,
    wants_offers
  )
  values (
    new.id,
    'user',
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    coalesce(new.raw_user_meta_data->>'city', ''),
    coalesce(new.raw_user_meta_data->>'state', ''),
    coalesce((new.raw_user_meta_data->>'budget_min')::numeric, 0),
    coalesce((new.raw_user_meta_data->>'budget_max')::numeric, 0),
    coalesce(array(select jsonb_array_elements_text(new.raw_user_meta_data->'preferred_brands')), '{}'),
    coalesce((new.raw_user_meta_data->>'wants_offers')::boolean, true)
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if current_user in ('postgres', 'service_role') then
    return new;
  end if;

  if old.role is distinct from new.role and not public.is_admin(auth.uid()) then
    raise exception 'Apenas admins podem alterar cargos.';
  end if;

  return new;
end;
$$;

drop trigger if exists phones_set_updated_at on public.phones;
create trigger phones_set_updated_at
before update on public.phones
for each row
execute function public.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
before update on public.profiles
for each row
execute function public.protect_profile_role();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

alter table public.phones enable row level security;
alter table public.phone_prices enable row level security;
alter table public.profiles enable row level security;

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

drop policy if exists "profiles select own or admin" on public.profiles;
create policy "profiles select own or admin"
on public.profiles for select
to authenticated
using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles insert own user" on public.profiles;
create policy "profiles insert own user"
on public.profiles for insert
to authenticated
with check (auth.uid() = id and role = 'user');

drop policy if exists "profiles update own or admin" on public.profiles;
create policy "profiles update own or admin"
on public.profiles for update
to authenticated
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

-- Escrita deve acontecer pelo backend usando SUPABASE_SERVICE_ROLE_KEY.
-- Nao crie politica publica de insert/update para o painel admin.
