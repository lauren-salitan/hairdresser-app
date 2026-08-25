import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatMoney } from "@/lib/format";
import { BookingActions } from "@/components/booking-actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profile?.role === "stylist") {
    const { data: stylist } = await supabase
      .from("stylists")
      .select("id, stripe_onboarded")
      .eq("id", user.id)
      .maybeSingle();

    if (!stylist) redirect("/onboarding/stylist");

    const { data: bookings } = await supabase
      .from("bookings")
      .select("*, services(name), profiles!bookings_client_id_fkey(full_name)")
      .eq("stylist_id", user.id)
      .order("start_time", { ascending: true });

    const upcoming = (bookings ?? []).filter(
      (b) => b.status === "pending" || b.status === "confirmed"
    );
    const past = (bookings ?? []).filter(
      (b) => !["pending", "confirmed"].includes(b.status)
    );

    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold">Your bookings</h1>
          <div className="flex gap-2 text-sm">
            <Link
              href="/dashboard/services"
              className="rounded-full border border-black/15 px-4 py-2 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
            >
              Manage services
            </Link>
            <Link
              href="/dashboard/availability"
              className="rounded-full border border-black/15 px-4 py-2 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
            >
              Set availability
            </Link>
          </div>
        </div>

        {!stylist.stripe_onboarded && (
          <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            You haven&apos;t connected a payout account yet, so you can&apos;t
            get paid for bookings.{" "}
            <a href="/api/stripe/connect" className="font-medium underline">
              Connect with Stripe
            </a>
          </div>
        )}

        <h2 className="mt-8 text-sm font-medium text-black/60 dark:text-white/60">
          Upcoming ({upcoming.length})
        </h2>
        <ul className="mt-2 divide-y divide-black/10 dark:divide-white/10">
          {upcoming.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="font-medium">
                  {b.services?.name} — {b.profiles?.full_name}
                </p>
                <p className="text-sm text-black/60 dark:text-white/60">
                  {formatDateTime(b.start_time)} · {formatMoney(b.price_cents)} ·{" "}
                  <span className="capitalize">{b.status}</span>
                </p>
              </div>
              <BookingActions bookingId={b.id} status={b.status} />
            </li>
          ))}
          {upcoming.length === 0 && (
            <p className="py-3 text-sm text-black/60 dark:text-white/60">
              No upcoming bookings.
            </p>
          )}
        </ul>

        {past.length > 0 && (
          <>
            <h2 className="mt-8 text-sm font-medium text-black/60 dark:text-white/60">
              Past
            </h2>
            <ul className="mt-2 divide-y divide-black/10 dark:divide-white/10">
              {past.map((b) => (
                <li key={b.id} className="py-3">
                  <p className="font-medium">
                    {b.services?.name} — {b.profiles?.full_name}
                  </p>
                  <p className="text-sm text-black/60 dark:text-white/60">
                    {formatDateTime(b.start_time)} · {formatMoney(b.price_cents)} ·{" "}
                    <span className="capitalize">{b.status}</span>
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  }

  // Client view
  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, services(name), stylists(business_name)")
    .eq("client_id", user.id)
    .order("start_time", { ascending: true });

  const upcoming = (bookings ?? []).filter(
    (b) => b.status === "pending" || b.status === "confirmed"
  );
  const past = (bookings ?? []).filter(
    (b) => !["pending", "confirmed"].includes(b.status)
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">
        Welcome back{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}
      </h1>

      <h2 className="mt-8 text-sm font-medium text-black/60 dark:text-white/60">
        Upcoming
      </h2>
      <ul className="mt-2 divide-y divide-black/10 dark:divide-white/10">
        {upcoming.map((b) => (
          <li key={b.id} className="py-3">
            <Link href={`/bookings/${b.id}`} className="font-medium hover:underline">
              {b.services?.name} with {b.stylists?.business_name}
            </Link>
            <p className="text-sm text-black/60 dark:text-white/60">
              {formatDateTime(b.start_time)} · {formatMoney(b.price_cents)} ·{" "}
              <span className="capitalize">{b.status}</span> ·{" "}
              <span className="capitalize">{b.payment_status}</span>
            </p>
          </li>
        ))}
        {upcoming.length === 0 && (
          <p className="py-3 text-sm text-black/60 dark:text-white/60">
            No upcoming bookings.{" "}
            <Link href="/browse" className="underline">
              Find a stylist
            </Link>
          </p>
        )}
      </ul>

      {past.length > 0 && (
        <>
          <h2 className="mt-8 text-sm font-medium text-black/60 dark:text-white/60">
            Past
          </h2>
          <ul className="mt-2 divide-y divide-black/10 dark:divide-white/10">
            {past.map((b) => (
              <li key={b.id} className="py-3">
                <p className="font-medium">
                  {b.services?.name} with {b.stylists?.business_name}
                </p>
                <p className="text-sm text-black/60 dark:text-white/60">
                  {formatDateTime(b.start_time)} · {formatMoney(b.price_cents)} ·{" "}
                  <span className="capitalize">{b.status}</span>
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
