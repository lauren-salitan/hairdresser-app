# Chairside — hairdresser booking platform

A two-sided marketplace: clients search, filter, and book hairdressers and pay
online; stylists manage their services, availability, and bookings, and get
paid out directly.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4)
- **Supabase** — Postgres database, auth, and row-level security
- **Stripe Connect** — marketplace payments (stylists onboard as Express
  connected accounts; clients pay via Stripe Checkout; the platform keeps a
  10% fee via `application_fee_amount`)

## Project already provisioned

A live Supabase project (`hairdresser-booking-app`, on the free tier) has
already been created and migrated — schema, row-level security policies, and
5 demo stylists with services and weekly availability are live. Credentials
are in `.env.local`.

Demo accounts (password for all: `password123`):

- Stylists: `ava.demo@chairside.app`, `marcus.demo@chairside.app`,
  `priya.demo@chairside.app`, `jasmine.demo@chairside.app`,
  `sofia.demo@chairside.app`
- Client: `demo.client@chairside.app`

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Sign in with a demo account above, or sign
up as a new client or stylist.

> **Note:** this project was scaffolded inside a sandboxed cloud dev
> environment whose outbound network access to the Supabase host wasn't
> allowlisted, so live database calls couldn't be exercised from inside that
> sandbox during the build (pages degraded gracefully — no 500s — instead of
> loading data). The build itself is clean (`npm run build` succeeds, no
> TypeScript errors). Run it locally or deploy it to see live data end to
> end.

## Enabling payments

Payments are fully wired up but need your own Stripe test keys to go live:

1. Create a [Stripe account](https://dashboard.stripe.com/register) (or use
   an existing one) and grab your **test mode** keys from
   https://dashboard.stripe.com/test/apikeys.
2. Fill in `.env.local`:
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. For webhooks (marks a booking paid after checkout), run
   `stripe listen --forward-to localhost:3000/api/stripe/webhook` locally
   (via the [Stripe CLI](https://stripe.com/docs/stripe-cli)) and copy the
   printed signing secret into `STRIPE_WEBHOOK_SECRET`. In production, create
   a webhook endpoint in the Stripe dashboard pointed at
   `https://<your-domain>/api/stripe/webhook` listening for
   `checkout.session.completed`.
4. Fill in `SUPABASE_SERVICE_ROLE_KEY` from your
   [Supabase API settings](https://supabase.com/dashboard/project/zxadpaghlshlrjsymubk/settings/api-keys)
   — the webhook route needs it to update a booking on behalf of the client
   who paid (that write can't go through the normal row-level-security-scoped
   client). Keep it server-side only; never expose it to the browser.
5. As a stylist, click **Connect with Stripe** on the dashboard to create a
   connected account and finish onboarding (test mode accepts fake details).

## What's built

- **Auth** — email/password sign-up with a role choice (client vs. stylist),
  sign-in, sign-out. New stylists are walked through a short onboarding form
  (business info, specialties, location).
- **Search & browse** (`/browse`) — filter stylists by specialty and city.
- **Stylist profile & booking** (`/stylists/[id]`) — services, a date
  picker, and live open time slots computed from the stylist's weekly
  availability minus existing bookings (a Postgres exclusion constraint
  additionally guarantees no double-booking at the database level, even
  under concurrent requests).
- **Booking + payment** (`/bookings/[id]`) — a pending booking is created
  immediately; "Pay now" starts a Stripe Checkout session that pays the
  stylist directly (minus the platform fee) and marks the booking confirmed
  once paid.
- **Client dashboard** (`/dashboard`) — upcoming and past bookings.
- **Stylist dashboard** (`/dashboard`, `/dashboard/services`,
  `/dashboard/availability`) — confirm/complete/cancel bookings, manage
  services (add, hide, delete), and set a weekly availability schedule.

## Data model

See `supabase/migrations/` for the full schema. Core tables: `profiles`
(shared identity + role), `stylists`, `services`, `availability_rules` /
`availability_exceptions`, `bookings`, `reviews`. Every table has row-level
security scoped to the right owner; public read access is limited to what
browsing/booking actually needs (e.g. a `SECURITY DEFINER` RPC exposes only
busy time ranges — never client identities — so anyone can compute open
slots for a stylist).

## Suggested next steps

- Add photo uploads (Supabase Storage) for stylist profiles and portfolios.
- Add reviews UI (the `reviews` table and rating aggregation trigger already
  exist).
- Add cancellation/refund handling on the Stripe side.
- Replace the plain city-text filter with real geocoding + radius search
  (the schema already has `lat`/`lng` columns on `stylists`, unused so far).
- Add push/email notifications for booking requests, confirmations, and
  reminders.
- Add a one-off "block this date" UI for `availability_exceptions` (the
  table and availability-calculation logic already support it).
