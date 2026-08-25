"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; success?: boolean } | null;

async function requireStylist() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, userId: user.id };
}

export async function createStylistProfile(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, userId } = await requireStylist();

  const business_name = String(formData.get("business_name") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const address_line = String(formData.get("address_line") ?? "").trim();
  const specialties = formData.getAll("specialties").map(String);

  if (!business_name || !city) {
    return { error: "Business name and city are required." };
  }

  const { error } = await supabase.from("stylists").upsert({
    id: userId,
    business_name,
    bio: bio || null,
    city,
    state: state || null,
    address_line: address_line || null,
    specialties,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function createService(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, userId } = await requireStylist();

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const duration_minutes = Number(formData.get("duration_minutes"));
  const price = Number(formData.get("price"));

  if (!name || !duration_minutes || Number.isNaN(price) || price < 0) {
    return { error: "Please fill in every field with valid values." };
  }

  const { error } = await supabase.from("services").insert({
    stylist_id: userId,
    name,
    description: description || null,
    duration_minutes,
    price_cents: Math.round(price * 100),
  });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/services");
  return { success: true };
}

export async function toggleServiceActive(serviceId: string, active: boolean) {
  const { supabase } = await requireStylist();
  await supabase.from("services").update({ active }).eq("id", serviceId);
  revalidatePath("/dashboard/services");
}

export async function deleteService(serviceId: string) {
  const { supabase } = await requireStylist();
  await supabase.from("services").delete().eq("id", serviceId);
  revalidatePath("/dashboard/services");
}

export async function setAvailabilityRules(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { supabase, userId } = await requireStylist();

  // Replace all rules with the submitted set (simple weekly schedule editor).
  const rules: { stylist_id: string; day_of_week: number; start_time: string; end_time: string }[] = [];
  for (let day = 0; day < 7; day++) {
    const enabled = formData.get(`day_${day}_enabled`);
    if (!enabled) continue;
    const start = String(formData.get(`day_${day}_start`) ?? "");
    const end = String(formData.get(`day_${day}_end`) ?? "");
    if (!start || !end) continue;
    rules.push({ stylist_id: userId, day_of_week: day, start_time: start, end_time: end });
  }

  const { error: deleteError } = await supabase
    .from("availability_rules")
    .delete()
    .eq("stylist_id", userId);
  if (deleteError) return { error: deleteError.message };

  if (rules.length > 0) {
    const { error: insertError } = await supabase
      .from("availability_rules")
      .insert(rules);
    if (insertError) return { error: insertError.message };
  }

  revalidatePath("/dashboard/availability");
  return { success: true };
}

export async function updateBookingStatus(
  bookingId: string,
  status: "confirmed" | "completed" | "cancelled" | "no_show"
) {
  const { supabase } = await requireStylist();
  await supabase.from("bookings").update({ status }).eq("id", bookingId);
  revalidatePath("/dashboard");
}
