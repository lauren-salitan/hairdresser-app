import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DAY_NAMES } from "@/lib/format";
import { AvailabilityForm } from "@/components/availability-form";

export default async function AvailabilityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: stylist } = await supabase
    .from("stylists")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (!stylist) redirect("/onboarding/stylist");

  const { data: rules } = await supabase
    .from("availability_rules")
    .select("*")
    .eq("stylist_id", user.id);

  const byDay = new Map(rules?.map((r) => [r.day_of_week, r]));

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <h1 className="text-2xl font-semibold">Weekly availability</h1>
      <p className="mt-1 text-sm text-black/60 dark:text-white/60">
        Set the hours you take bookings each week. You can still block off a
        single date later.
      </p>

      <AvailabilityForm
        days={DAY_NAMES.map((name, i) => ({
          index: i,
          name,
          rule: byDay.get(i)
            ? {
                start: byDay.get(i)!.start_time.slice(0, 5),
                end: byDay.get(i)!.end_time.slice(0, 5),
              }
            : null,
        }))}
      />
    </div>
  );
}
