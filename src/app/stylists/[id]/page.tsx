import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BookingWidget } from "@/components/booking-widget";
import { formatMoney, formatDuration } from "@/lib/format";

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
          {stylist.rating_count > 0 && (
            <span className="shrink-0 text-sm text-muted">
              ★ {stylist.rating_avg.toFixed(1)} ({stylist.rating_count} reviews)
            </span>
          )}
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
        <ul className="mt-3 divide-y divide-white/10">
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
