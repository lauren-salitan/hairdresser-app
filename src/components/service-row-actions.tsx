"use client";

import { useTransition } from "react";
import { toggleServiceActive, deleteService } from "@/lib/actions/stylist";

export function ServiceRowActions({
  serviceId,
  active,
}: {
  serviceId: string;
  active: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex shrink-0 gap-2 text-xs">
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(() => toggleServiceActive(serviceId, !active))
        }
        className="rounded-full border border-black/15 px-3 py-1.5 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
      >
        {active ? "Hide" : "Show"}
      </button>
      <button
        disabled={isPending}
        onClick={() => {
          if (confirm("Delete this service? This can't be undone.")) {
            startTransition(() => deleteService(serviceId));
          }
        }}
        className="rounded-full border border-black/15 px-3 py-1.5 hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
      >
        Delete
      </button>
    </div>
  );
}
