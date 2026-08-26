-- Optional link from a stylist to their real Google Business Profile, plus a
-- cached copy of the rating/review snippets so we don't hit the Places API
-- on every profile page view. `google_synced_at` drives when to refresh.
alter table stylists
  add column google_place_id text,
  add column google_rating numeric(2,1),
  add column google_review_count integer,
  add column google_reviews jsonb not null default '[]'::jsonb,
  add column google_synced_at timestamptz;
