"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type BookingActionState = { error?: string } | null;

export async function createBooking(
  _prevState: BookingActionState,
  formData: FormData
): Promise<BookingActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const stylistId = String(formData.get("stylist_id") ?? "");
  const serviceId = String(formData.get("service_id") ?? "");
  const startTime = String(formData.get("start_time") ?? "");

  if (!stylistId || !serviceId || !startTime) {
    return { error: "Please choose a service and time." };
  }

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("duration_minutes, price_cents, active")
    .eq("id", serviceId)
    .single();

  if (serviceError || !service || !service.active) {
    return { error: "That service is no longer available." };
  }

  const start = new Date(startTime);
  if (Number.isNaN(start.getTime()) || start.getTime() < Date.now()) {
    return { error: "Please choose a valid, upcoming time." };
  }
  const end = new Date(start.getTime() + service.duration_minutes * 60000);

  // Platform fee: 10%, paid by the client on top of the stylist's price is a
  // common marketplace pattern, but here we take it out of the listed price
  // so the stylist's price is exactly what the client pays.
  const platformFeeCents = Math.round(service.price_cents * 0.1);

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      client_id: user.id,
      stylist_id: stylistId,
      service_id: serviceId,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      price_cents: service.price_cents,
      platform_fee_cents: platformFeeCents,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23P01") {
      // exclusion constraint violation = the slot was just taken
      return { error: "That time was just booked by someone else. Please pick another." };
    }
    return { error: error.message };
  }

  redirect(`/bookings/${booking.id}`);
}
