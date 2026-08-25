import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAvailableSlots } from "@/lib/availability";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stylistId = searchParams.get("stylist_id");
  const serviceId = searchParams.get("service_id");
  const date = searchParams.get("date");

  if (!stylistId || !serviceId || !date) {
    return NextResponse.json(
      { error: "stylist_id, service_id, and date are required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();
  const slots = await getAvailableSlots(supabase, stylistId, serviceId, date);

  return NextResponse.json({ slots });
}
