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
      {state?.error && <p className="alert-error">{state.error}</p>}
      {state?.success && <p className="alert-success">Schedule saved.</p>}

      {days.map((day) => (
        <div key={day.index} className="card-glass flex items-center gap-3 !p-3">
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
            className="input-glass w-auto py-1 text-sm"
          />
          <span className="text-muted-2">to</span>
          <input
            type="time"
            name={`day_${day.index}_end`}
            defaultValue={day.rule?.end ?? "17:00"}
            disabled={!enabled[day.index]}
            className="input-glass w-auto py-1 text-sm"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={pending}
        className="btn-primary mt-2 self-start !px-4 !py-2 text-sm"
      >
        {pending ? "Saving…" : "Save schedule"}
      </button>
    </form>
  );
}
