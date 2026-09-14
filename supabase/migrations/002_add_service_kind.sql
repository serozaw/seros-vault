-- Sero's Vault — migration: allow "service" orders (management retainer via Stripe)
-- Run this once in the Supabase SQL editor if your `orders` table already
-- exists (i.e. you ran the original schema.sql before this file existed).
-- A brand-new project can skip this — supabase/schema.sql already includes
-- these changes.

alter table orders drop constraint if exists orders_kind_check;
alter table orders add constraint orders_kind_check check (kind in ('preset', 'booking', 'service'));

alter table orders add column if not exists service_id text;
