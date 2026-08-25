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
    <div className="flex shrink-0 gap-2 text-xs">
      {status === "pending" && (
        <button
          disabled={isPending}
          onClick={() => set("confirmed")}
          className="rounded-full bg-foreground px-3 py-1.5 font-medium text-background hover:opacity-90 disabled:opacity-40"
        >
          Confirm
        </button>
      )}
      {status === "confirmed" && (
        <button
          disabled={isPending}
          onClick={() => set("completed")}
          className="rounded-full bg-foreground px-3 py-1.5 font-medium text-background hover:opacity-90 disabled:opacity-40"
        >
          Mark completed
        </button>
      )}
      {(status === "pending" || status === "confirmed") && (
        <button
          disabled={isPending}
          onClick={() => set("cancelled")}
          className="rounded-full border border-black/15 px-3 py-1.5 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
