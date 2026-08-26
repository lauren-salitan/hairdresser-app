import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingWidget } from "@/components/booking-widget";
import { formatMoney, formatDuration } from "@/lib/format";
import type { PlaceReview } from "@/lib/google/places";

export default async function StylistProfilePage(
  props: PageProps<"/stylists/[id]">
) {
  const { id } = await props.params;
  const supabase = await createClient();

  const { data: stylist } = await supabase
    .from("stylists")
    .select("*, services(*)")
    .eq("id", id)
    .single();

  if (!stylist) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const activeServices = (stylist.services ?? []).filter((s) => s.active);
  const googleReviews = Array.isArray(stylist.google_reviews)
    ? (stylist.google_reviews as unknown as PlaceReview[])
    : [];

  return (
    <div className="mx-auto grid max-w-5xl grid-cols-1 gap-10 px-4 py-10 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold">
              {stylist.business_name}
            </h1>
            <p className="text-sm text-muted">
              {[stylist.address_line, stylist.city, stylist.state]
                .filter(Boolean)
                .join(", ")}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-0.5 text-sm text-muted">
            {stylist.google_rating !== null && (
              <span>
                ★ {stylist.google_rating.toFixed(1)} on Google
                {stylist.google_review_count !== null &&
                  ` (${stylist.google_review_count})`}
              </span>
            )}
            {stylist.google_rating === null && stylist.rating_count > 0 && (
              <span>
                ★ {stylist.rating_avg.toFixed(1)} ({stylist.rating_count} reviews)
              </span>
            )}
          </div>
        </div>

        {stylist.bio && <p className="mt-4 text-foreground/90">{stylist.bio}</p>}

        <div className="mt-4 flex flex-wrap gap-1.5">
          {stylist.specialties.map((s) => (
            <span key={s} className="badge-glass">
              {s}
            </span>
          ))}
        </div>

        <h2 className="font-display mt-10 font-semibold">Services</h2>
        <ul className="mt-3 divide-y divide-border">
          {activeServices.map((service) => (
            <li key={service.id} className="flex items-start justify-between py-3">
              <div>
                <p className="font-medium">{service.name}</p>
                {service.description && (
                  <p className="text-sm text-muted">{service.description}</p>
                )}
                <p className="text-sm text-muted-2">
                  {formatDuration(service.duration_minutes)}
                </p>
              </div>
              <p className="font-semibold">{formatMoney(service.price_cents)}</p>
            </li>
          ))}
          {activeServices.length === 0 && (
            <p className="py-3 text-sm text-muted">No services listed yet.</p>
          )}
        </ul>

        {googleReviews.length > 0 && (
          <>
            <h2 className="font-display mt-10 font-semibold">
              What people say on Google
            </h2>
            <ul className="mt-3 flex flex-col gap-3">
              {googleReviews.slice(0, 5).map((r, i) => (
                <li key={i} className="card-glass">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{r.authorName}</p>
                    <span className="text-xs text-muted-2">{r.relativeTime}</span>
                  </div>
                  <p className="text-xs text-muted">{"★".repeat(Math.round(r.rating))}</p>
                  {r.text && <p className="mt-2 text-sm text-foreground/90">{r.text}</p>}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted-2">Reviews via Google</p>
          </>
        )}
      </div>

      <div>
        <BookingWidget
          stylistId={stylist.id}
          services={activeServices}
          isSignedIn={!!user}
        />
      </div>
    </div>
  );
}
