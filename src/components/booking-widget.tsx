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
      <p className="text-sm text-muted">
        This stylist hasn&apos;t added any services yet.
      </p>
    );
  }

  return (
    <div className="card-glass sticky top-24">
      <h2 className="font-display font-semibold">Book an appointment</h2>

      <label className="mt-4 flex flex-col gap-1 text-sm">
        Service
        <select
          value={selectedServiceId}
          onChange={(e) => setSelectedServiceId(e.target.value)}
          className="input-glass"
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
          className="input-glass"
        />
      </label>

      <div className="mt-4">
        <p className="text-sm font-medium">Available times</p>
        {loadingSlots && (
          <p className="mt-2 text-sm text-muted-2">Loading…</p>
        )}
        {!loadingSlots && slots?.length === 0 && (
          <p className="mt-2 text-sm text-muted-2">
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
                className={
                  selectedSlot === slot ? "slot-btn-selected" : "slot-btn"
                }
              >
                {formatTime(slot)}
              </button>
            ))}
          </div>
        )}
      </div>

      {state?.error && <p className="alert-error mt-4">{state.error}</p>}

      <form action={formAction} className="mt-4">
        <input type="hidden" name="stylist_id" value={stylistId} />
        <input type="hidden" name="service_id" value={selectedServiceId} />
        <input type="hidden" name="start_time" value={selectedSlot ?? ""} />
        {isSignedIn ? (
          <button
            type="submit"
            disabled={!selectedSlot || pending}
            className="btn-primary w-full"
          >
            {pending ? "Booking…" : "Request this time"}
          </button>
        ) : (
          <a href="/login" className="btn-secondary block w-full text-center">
            Sign in to book
          </a>
        )}
      </form>
    </div>
  );
}
