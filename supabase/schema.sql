-- Sero's Vault — Supabase schema
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  stripe_session_id text unique not null,
  kind text not null check (kind in ('preset', 'booking', 'service', 'tip')),
  preset_id text,
  package_id text,
  service_id text,
  email text,
  amount_cents integer not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'expired')),
  download_token uuid,
  tip_message text,
  created_at timestamptz not null default now()
);

create index if not exists orders_stripe_session_id_idx on orders (stripe_session_id);
create index if not exists orders_download_token_idx on orders (download_token);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders (id),
  package_id text not null,
  email text,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'hold' check (status in ('hold', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Prevents two bookings from ever overlapping in time, at the database
-- level — this is what makes double-booking impossible even under
-- concurrent requests. Expired holds are deleted by the API before each
-- new hold is created (see app/api/checkout/booking/route.ts), so they
-- don't block a slot forever.
alter table bookings
  add constraint no_overlapping_bookings
  exclude using gist (tstzrange(starts_at, ends_at, '[)') with &&)
  where (status <> 'cancelled');

create index if not exists bookings_starts_at_idx on bookings (starts_at);

-- Row Level Security: lock the tables down. All reads/writes happen through
-- server-side API routes using the service role key, which bypasses RLS —
-- the public anon key (if you ever use it client-side) gets no access.
alter table orders enable row level security;
alter table bookings enable row level security;
