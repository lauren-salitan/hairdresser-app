import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";

export async function POST(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const formData = await request.formData();
  const bookingId = String(formData.get("booking_id") ?? "");

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.redirect(
      `${appUrl}/bookings/${bookingId}?error=${encodeURIComponent(
        "Payments aren't configured yet."
      )}`
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${appUrl}/login`);

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, services(name), stylists(business_name, stripe_account_id, stripe_onboarded)")
    .eq("id", bookingId)
    .eq("client_id", user.id)
    .single();

  if (!booking) {
    return NextResponse.redirect(`${appUrl}/dashboard`);
  }

  if (!booking.stylists?.stripe_onboarded || !booking.stylists.stripe_account_id) {
    return NextResponse.redirect(
      `${appUrl}/bookings/${bookingId}?error=${encodeURIComponent(
        "This stylist hasn't finished setting up payouts yet."
      )}`
    );
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: booking.price_cents,
          product_data: {
            name: `${booking.services?.name ?? "Appointment"} — ${booking.stylists.business_name}`,
          },
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: booking.platform_fee_cents,
      transfer_data: {
        destination: booking.stylists.stripe_account_id,
      },
    },
    metadata: { booking_id: booking.id },
    success_url: `${appUrl}/bookings/${booking.id}?paid=1`,
    cancel_url: `${appUrl}/bookings/${booking.id}`,
  });

  return NextResponse.redirect(session.url!, { status: 303 });
}
