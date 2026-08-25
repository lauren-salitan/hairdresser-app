import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SPECIALTIES } from "@/lib/constants";
import { formatMoney } from "@/lib/format";

export default async function BrowsePage(props: PageProps<"/browse">) {
  const searchParams = await props.searchParams;
  const specialty =
    typeof searchParams.specialty === "string" ? searchParams.specialty : "";
  const city = typeof searchParams.city === "string" ? searchParams.city : "";

  const supabase = await createClient();

  let query = supabase
    .from("stylists")
    .select(
      "id, business_name, bio, city, state, specialties, rating_avg, rating_count, services(price_cents, active)"
    )
    .order("rating_avg", { ascending: false });

  if (specialty) query = query.contains("specialties", [specialty]);
  if (city) query = query.ilike("city", `%${city}%`);

  const { data: stylists, error } = await query;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-2xl font-semibold">Find a stylist</h1>

      <form className="mt-6 flex flex-wrap gap-3" action="/browse">
        <select
          name="specialty"
          defaultValue={specialty}
          className="input-glass w-auto"
        >
          <option value="">All specialties</option>
          {SPECIALTIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="city"
          defaultValue={city}
          placeholder="City"
          className="input-glass w-auto"
        />
        <button type="submit" className="btn-primary !px-5 !py-2 text-sm">
          Search
        </button>
      </form>

      {error && (
        <p className="alert-error mt-8">
          Something went wrong loading stylists: {error.message}
        </p>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stylists?.map((stylist) => {
          const activePrices = stylist.services
            .filter((s) => s.active)
            .map((s) => s.price_cents);
          const minPrice = activePrices.length ? Math.min(...activePrices) : null;

          return (
            <Link
              key={stylist.id}
              href={`/stylists/${stylist.id}`}
              className="card-glass"
            >
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-display font-semibold">
                  {stylist.business_name}
                </h2>
                {stylist.rating_count > 0 && (
                  <span className="shrink-0 text-sm text-muted">
                    ★ {stylist.rating_avg.toFixed(1)} ({stylist.rating_count})
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-muted">
                {[stylist.city, stylist.state].filter(Boolean).join(", ")}
              </p>
              {stylist.bio && (
                <p className="mt-2 line-clamp-2 text-sm text-muted">
                  {stylist.bio}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {stylist.specialties.slice(0, 4).map((s) => (
                  <span key={s} className="badge-glass">
                    {s}
                  </span>
                ))}
              </div>
              {minPrice !== null && (
                <p className="mt-3 text-sm font-semibold">
                  From {formatMoney(minPrice)}
                </p>
              )}
            </Link>
          );
        })}
      </div>

      {stylists?.length === 0 && (
        <p className="mt-12 text-center text-muted">
          No stylists match those filters yet.
        </p>
      )}
    </div>
  );
}
