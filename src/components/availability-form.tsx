"use client";

import { useActionState, useState } from "react";
import { setAvailabilityRules, type ActionState } from "@/lib/actions/stylist";

type Day = {
  index: number;
  name: string;
  rule: { start: string; end: string } | null;
};

export function AvailabilityForm({ days }: { days: Day[] }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    setAvailabilityRules,
    null
  );
  const [enabled, setEnabled] = useState<Record<number, boolean>>(
    Object.fromEntries(days.map((d) => [d.index, !!d.rule]))
  );

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-3">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950 dark:text-green-300">
          Schedule saved.
        </p>
      )}

      {days.map((day) => (
        <div
          key={day.index}
          className="flex items-center gap-3 rounded-lg border border-black/10 px-3 py-2 dark:border-white/10"
        >
          <label className="flex w-28 shrink-0 items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              name={`day_${day.index}_enabled`}
              defaultChecked={!!day.rule}
              onChange={(e) =>
                setEnabled((prev) => ({ ...prev, [day.index]: e.target.checked }))
              }
            />
            {day.name}
          </label>
          <input
            type="time"
            name={`day_${day.index}_start`}
            defaultValue={day.rule?.start ?? "09:00"}
            disabled={!enabled[day.index]}
            className="rounded-md border border-black/15 px-2 py-1 text-sm disabled:opacity-40 dark:border-white/20 dark:bg-transparent"
          />
          <span className="text-black/40">to</span>
          <input
            type="time"
            name={`day_${day.index}_end`}
            defaultValue={day.rule?.end ?? "17:00"}
            disabled={!enabled[day.index]}
            className="rounded-md border border-black/15 px-2 py-1 text-sm disabled:opacity-40 dark:border-white/20 dark:bg-transparent"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 self-start rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save schedule"}
      </button>
    </form>
  );
}
