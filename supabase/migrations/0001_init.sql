-- Hairdresser booking platform: initial schema
-- profiles: one row per auth user, holds role + shared identity fields
create type user_role as enum ('client', 'stylist');
create type booking_status as enum ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
create type payment_status as enum ('unpaid', 'paid', 'refunded');

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'client',
  full_name text not null,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- stylists: extra business info for profiles with role = 'stylist'
create table stylists (
  id uuid primary key references profiles(id) on delete cascade,
  business_name text not null,
  bio text,
  specialties text[] not null default '{}',
  address_line text,
  city text,
  state text,
  postal_code text,
  lat double precision,
  lng double precision,
  stripe_account_id text,
  stripe_onboarded boolean not null default false,
  rating_avg numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index stylists_city_idx on stylists (city);
create index stylists_specialties_idx on stylists using gin (specialties);

-- services offered by a stylist
create table services (
  id uuid primary key default gen_random_uuid(),
  stylist_id uuid not null references stylists(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer not null check (duration_minutes > 0),
  price_cents integer not null check (price_cents >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index services_stylist_idx on services (stylist_id);

-- recurring weekly availability, e.g. every Monday 9am-5pm
create table availability_rules (
  id uuid primary key default gen_random_uuid(),
  stylist_id uuid not null references stylists(id) on delete cascade,
  day_of_week integer not null check (day_of_week between 0 and 6), -- 0 = Sunday
  start_time time not null,
  end_time time not null check (end_time > start_time)
);
create index availability_rules_stylist_idx on availability_rules (stylist_id);

-- one-off exceptions: block a specific date, or add/override hours for it
create table availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  stylist_id uuid not null references stylists(id) on delete cascade,
  date date not null,
  is_closed boolean not null default true,
  start_time time,
  end_time time
);
create index availability_exceptions_stylist_idx on availability_exceptions (stylist_id, date);

-- bookings
create table bookings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id) on delete cascade,
  stylist_id uuid not null references stylists(id) on delete cascade,
  service_id uuid not null references services(id),
  start_time timestamptz not null,
  end_time timestamptz not null check (end_time > start_time),
  status booking_status not null default 'pending',
  price_cents integer not null,
  platform_fee_cents integer not null default 0,
  stripe_payment_intent_id text,
  payment_status payment_status not null default 'unpaid',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index bookings_client_idx on bookings (client_id);
create index bookings_stylist_idx on bookings (stylist_id);
create index bookings_start_time_idx on bookings (start_time);
-- prevent double-booking the same stylist for overlapping confirmed/pending slots
create extension if not exists btree_gist;
alter table bookings
  add constraint bookings_no_overlap
  exclude using gist (
    stylist_id with =,
    tstzrange(start_time, end_time) with &&
  ) where (status in ('pending', 'confirmed'));

-- reviews
create table reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references bookings(id) on delete cascade,
  client_id uuid not null references profiles(id) on delete cascade,
  stylist_id uuid not null references stylists(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);
create index reviews_stylist_idx on reviews (stylist_id);

-- keep stylist rating aggregates in sync
create or replace function update_stylist_rating() returns trigger as $$
begin
  update stylists set
    rating_avg = coalesce((select avg(rating) from reviews where stylist_id = coalesce(new.stylist_id, old.stylist_id)), 0),
    rating_count = (select count(*) from reviews where stylist_id = coalesce(new.stylist_id, old.stylist_id))
  where id = coalesce(new.stylist_id, old.stylist_id);
  return null;
end;
$$ language plpgsql;
create trigger reviews_rating_sync
  after insert or update or delete on reviews
  for each row execute function update_stylist_rating();

-- auto-create a profile row when a new auth user signs up
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, role, full_name)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'client'),
    coalesce(new.raw_user_meta_data->>'full_name', 'New User')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
