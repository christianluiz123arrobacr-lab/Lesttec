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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

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

alter table public.profiles enable row level security;

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

-- Depois de criar sua conta pelo site, rode uma vez trocando o e-mail:
-- update public.profiles
-- set role = 'admin'
-- where id = (select id from auth.users where email = 'SEU_EMAIL_AQUI');
