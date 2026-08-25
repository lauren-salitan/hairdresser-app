import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDateTime, formatMoney } from "@/lib/format";

export default async function BookingDetailPage(
  props: PageProps<"/bookings/[id]">
) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, services(name, description), stylists(business_name, address_line, city, state)")
    .eq("id", id)
    .single();

  if (!booking) notFound();

  const error =
    typeof searchParams.error === "string" ? searchParams.error : null;
  const justPaid = searchParams.paid === "1";

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold">
        {justPaid ? "You're booked!" : "Booking request sent"}
      </h1>
      <p className="mt-1 text-sm text-black/60 dark:text-white/60">
        {justPaid
          ? "Your payment went through and your appointment is confirmed."
          : "The stylist will confirm shortly. You can pay any time before your appointment."}
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mt-6 rounded-xl border border-black/10 p-5 dark:border-white/10">
        <p className="font-semibold">{booking.services?.name}</p>
        <p className="text-sm text-black/60 dark:text-white/60">
          with {booking.stylists?.business_name}
        </p>
        <p className="mt-3 text-sm">{formatDateTime(booking.start_time)}</p>
        <p className="text-sm text-black/60 dark:text-white/60">
          {[booking.stylists?.address_line, booking.stylists?.city, booking.stylists?.state]
            .filter(Boolean)
            .join(", ")}
        </p>
        <div className="mt-4 flex items-center justify-between border-t border-black/10 pt-4 dark:border-white/10">
          <span className="text-sm">
            Status: <span className="capitalize">{booking.status}</span>
          </span>
          <span className="font-medium">{formatMoney(booking.price_cents)}</span>
        </div>
      </div>

      {booking.payment_status === "paid" ? (
        <p className="mt-6 text-sm text-green-700 dark:text-green-400">
          Paid ✓
        </p>
      ) : (
        <form action="/api/checkout" method="POST" className="mt-6">
          <input type="hidden" name="booking_id" value={booking.id} />
          <button
            type="submit"
            className="w-full rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90"
          >
            Pay {formatMoney(booking.price_cents)} now
          </button>
        </form>
      )}
    </div>
  );
}
