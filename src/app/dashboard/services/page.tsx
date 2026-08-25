import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatMoney, formatDuration } from "@/lib/format";
import { NewServiceForm } from "@/components/new-service-form";
import { ServiceRowActions } from "@/components/service-row-actions";

export default async function ServicesPage() {
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

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("stylist_id", user.id)
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-display text-2xl font-semibold">Your services</h1>
      <p className="mt-1 text-sm text-muted">
        Clients pick from these when booking. Toggle a service off to hide it
        without deleting it.
      </p>

      <ul className="mt-8 divide-y divide-white/10">
        {services?.map((service) => (
          <li key={service.id} className="flex items-center justify-between gap-3 py-3">
            <div className={service.active ? "" : "opacity-50"}>
              <p className="font-medium">{service.name}</p>
              <p className="text-sm text-muted">
                {formatMoney(service.price_cents)} ·{" "}
                {formatDuration(service.duration_minutes)}
              </p>
            </div>
            <ServiceRowActions serviceId={service.id} active={service.active} />
          </li>
        ))}
        {services?.length === 0 && (
          <p className="py-3 text-sm text-muted">
            No services yet — add your first one below.
          </p>
        )}
      </ul>

      <h2 className="font-display mt-10 font-semibold">Add a service</h2>
      <NewServiceForm />
    </div>
  );
}
