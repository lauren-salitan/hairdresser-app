import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const SLOT_INCREMENT_MINUTES = 30;

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Returns available start times (as ISO strings, in the server's local
 * interpretation of `date`) for a given stylist/service/date, taking into
 * account the weekly availability rules, one-off exceptions, and existing
 * pending/confirmed bookings.
 */
export async function getAvailableSlots(
  supabase: SupabaseClient<Database>,
  stylistId: string,
  serviceId: string,
  date: string // YYYY-MM-DD
): Promise<string[]> {
  const { data: service } = await supabase
    .from("services")
    .select("duration_minutes")
    .eq("id", serviceId)
    .single();
  if (!service) return [];

  const dayOfWeek = new Date(`${date}T00:00:00`).getDay();

  const { data: exception } = await supabase
    .from("availability_exceptions")
    .select("*")
    .eq("stylist_id", stylistId)
    .eq("date", date)
    .maybeSingle();

  if (exception?.is_closed) return [];

  let windows: { start: number; end: number }[] = [];

  if (exception?.start_time && exception?.end_time) {
    windows = [
      {
        start: timeToMinutes(exception.start_time),
        end: timeToMinutes(exception.end_time),
      },
    ];
  } else {
    const { data: rules } = await supabase
      .from("availability_rules")
      .select("*")
      .eq("stylist_id", stylistId)
      .eq("day_of_week", dayOfWeek);
    windows = (rules ?? []).map((r) => ({
      start: timeToMinutes(r.start_time),
      end: timeToMinutes(r.end_time),
    }));
  }

  if (windows.length === 0) return [];

  // RLS on `bookings` only lets a client see their own bookings or a stylist
  // see bookings made with them, so a third party (or anonymous visitor)
  // browsing this stylist's page can't read the table directly. This RPC
  // exposes just the busy time ranges needed to compute open slots.
  const { data: existingBookings } = await supabase.rpc(
    "get_stylist_busy_times",
    { p_stylist_id: stylistId, p_date: date }
  );

  const busy = (existingBookings ?? []).map((b) => ({
    start: new Date(b.start_time).getTime(),
    end: new Date(b.end_time).getTime(),
  }));

  const duration = service.duration_minutes;
  const slots: string[] = [];

  for (const window of windows) {
    for (
      let minutes = window.start;
      minutes + duration <= window.end;
      minutes += SLOT_INCREMENT_MINUTES
    ) {
      const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
      const mm = String(minutes % 60).padStart(2, "0");
      const slotStart = new Date(`${date}T${hh}:${mm}:00`);
      const slotEnd = new Date(slotStart.getTime() + duration * 60000);

      const overlaps = busy.some(
        (b) => slotStart.getTime() < b.end && slotEnd.getTime() > b.start
      );

      // Don't offer slots in the past.
      if (!overlaps && slotStart.getTime() > Date.now()) {
        slots.push(slotStart.toISOString());
      }
    }
  }

  return slots;
}
