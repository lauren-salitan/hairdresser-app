-- Row Level Security policies

alter table profiles enable row level security;
alter table stylists enable row level security;
alter table services enable row level security;
alter table availability_rules enable row level security;
alter table availability_exceptions enable row level security;
alter table bookings enable row level security;
alter table reviews enable row level security;

-- profiles: anyone signed in can read basic profile info (needed to show client/stylist names);
-- a user can only insert/update their own row.
create policy "profiles are readable by authenticated users"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

-- stylists: public read (needed for anonymous browsing/search); only the stylist can manage their own row.
create policy "stylists are publicly readable"
  on stylists for select
  using (true);

create policy "stylist can insert own row"
  on stylists for insert
  with check (auth.uid() = id);

create policy "stylist can update own row"
  on stylists for update
  using (auth.uid() = id);

-- services: public read of active services; stylist manages their own.
create policy "active services are publicly readable"
  on services for select
  using (active = true or stylist_id = auth.uid());

create policy "stylist manages own services"
  on services for insert
  with check (stylist_id = auth.uid());

create policy "stylist updates own services"
  on services for update
  using (stylist_id = auth.uid());

create policy "stylist deletes own services"
  on services for delete
  using (stylist_id = auth.uid());

-- availability: public read; stylist manages own.
create policy "availability rules are publicly readable"
  on availability_rules for select
  using (true);

create policy "stylist manages own availability rules"
  on availability_rules for all
  using (stylist_id = auth.uid())
  with check (stylist_id = auth.uid());

create policy "availability exceptions are publicly readable"
  on availability_exceptions for select
  using (true);

create policy "stylist manages own availability exceptions"
  on availability_exceptions for all
  using (stylist_id = auth.uid())
  with check (stylist_id = auth.uid());

-- bookings: a client can see/create their own bookings; a stylist can see/manage bookings made with them.
create policy "clients read own bookings"
  on bookings for select
  using (client_id = auth.uid() or stylist_id = auth.uid());

create policy "clients create bookings for themselves"
  on bookings for insert
  with check (client_id = auth.uid());

create policy "client or stylist can update a booking"
  on bookings for update
  using (client_id = auth.uid() or stylist_id = auth.uid());

-- reviews: public read; a client can leave one review per completed booking they made.
create policy "reviews are publicly readable"
  on reviews for select
  using (true);

create policy "client creates review for own booking"
  on reviews for insert
  with check (
    client_id = auth.uid()
    and exists (
      select 1 from bookings
      where bookings.id = booking_id
        and bookings.client_id = auth.uid()
        and bookings.status = 'completed'
    )
  );
