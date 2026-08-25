"use client";

import { useActionState, useEffect, useState } from "react";
import { createBooking, type BookingActionState } from "@/lib/actions/bookings";
import { formatMoney, formatDuration, formatTime } from "@/lib/format";

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
};

export function BookingWidget({
  stylistId,
  services,
  isSignedIn,
}: {
  stylistId: string;
  services: Service[];
  isSignedIn: boolean;
}) {
  const [selectedServiceId, setSelectedServiceId] = useState(
    services[0]?.id ?? ""
  );
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [slots, setSlots] = useState<string[] | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [state, formAction, pending] = useActionState<
    BookingActionState,
    FormData
  >(createBooking, null);

  const minDate = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (!selectedServiceId || !date) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    const params = new URLSearchParams({
      stylist_id: stylistId,
      service_id: selectedServiceId,
      date,
    });
    fetch(`/api/availability?${params}`)
      .then((res) => res.json())
      .then((data) => setSlots(data.slots ?? []))
      .finally(() => setLoadingSlots(false));
  }, [stylistId, selectedServiceId, date]);

  if (services.length === 0) {
    return (
      <p className="text-sm text-black/60 dark:text-white/60">
        This stylist hasn&apos;t added any services yet.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-black/10 p-5 dark:border-white/10">
      <h2 className="font-semibold">Book an appointment</h2>

      <label className="mt-4 flex flex-col gap-1 text-sm">
        Service
        <select
          value={selectedServiceId}
          onChange={(e) => setSelectedServiceId(e.target.value)}
          className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        >
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} — {formatMoney(s.price_cents)} (
              {formatDuration(s.duration_minutes)})
            </option>
          ))}
        </select>
      </label>

      <label className="mt-3 flex flex-col gap-1 text-sm">
        Date
        <input
          type="date"
          value={date}
          min={minDate}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        />
      </label>

      <div className="mt-4">
        <p className="text-sm font-medium">Available times</p>
        {loadingSlots && (
          <p className="mt-2 text-sm text-black/50 dark:text-white/50">
            Loading…
          </p>
        )}
        {!loadingSlots && slots?.length === 0 && (
          <p className="mt-2 text-sm text-black/50 dark:text-white/50">
            No open times that day. Try another date.
          </p>
        )}
        {!loadingSlots && slots && slots.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {slots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={`rounded-md border px-2 py-1.5 text-sm ${
                  selectedSlot === slot
                    ? "border-foreground bg-foreground text-background"
                    : "border-black/15 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
                }`}
              >
                {formatTime(slot)}
              </button>
            ))}
          </div>
        )}
      </div>

      {state?.error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <form action={formAction} className="mt-4">
        <input type="hidden" name="stylist_id" value={stylistId} />
        <input type="hidden" name="service_id" value={selectedServiceId} />
        <input type="hidden" name="start_time" value={selectedSlot ?? ""} />
        {isSignedIn ? (
          <button
            type="submit"
            disabled={!selectedSlot || pending}
            className="w-full rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-40"
          >
            {pending ? "Booking…" : "Request this time"}
          </button>
        ) : (
          <a
            href="/login"
            className="block w-full rounded-full border border-black/15 px-4 py-2.5 text-center text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            Sign in to book
          </a>
        )}
      </form>
    </div>
  );
}
