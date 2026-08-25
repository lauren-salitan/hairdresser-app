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
    <div className="flex shrink-0 gap-2">
      <button
        disabled={isPending}
        onClick={() =>
          startTransition(() => toggleServiceActive(serviceId, !active))
        }
        className="btn-secondary !px-3 !py-1.5 text-xs"
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
        className="btn-secondary !px-3 !py-1.5 text-xs"
      >
        Delete
      </button>
    </div>
  );
}
