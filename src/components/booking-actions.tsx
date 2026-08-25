"use client";

import { useTransition } from "react";
import { updateBookingStatus } from "@/lib/actions/stylist";

export function BookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  const set = (next: "confirmed" | "completed" | "cancelled" | "no_show") =>
    startTransition(() => updateBookingStatus(bookingId, next));

  return (
    <div className="flex shrink-0 gap-2">
      {status === "pending" && (
        <button
          disabled={isPending}
          onClick={() => set("confirmed")}
          className="btn-primary !px-3 !py-1.5 text-xs"
        >
          Confirm
        </button>
      )}
      {status === "confirmed" && (
        <button
          disabled={isPending}
          onClick={() => set("completed")}
          className="btn-primary !px-3 !py-1.5 text-xs"
        >
          Mark completed
        </button>
      )}
      {(status === "pending" || status === "confirmed") && (
        <button
          disabled={isPending}
          onClick={() => set("cancelled")}
          className="btn-secondary !px-3 !py-1.5 text-xs"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
