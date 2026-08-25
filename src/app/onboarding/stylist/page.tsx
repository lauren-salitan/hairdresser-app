"use client";

import { useActionState } from "react";
import { createStylistProfile, type ActionState } from "@/lib/actions/stylist";
import { SPECIALTIES } from "@/lib/constants";

export default function StylistOnboardingPage() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createStylistProfile,
    null
  );

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-2xl font-semibold">Set up your stylist profile</h1>
      <p className="mt-1 text-sm text-black/60 dark:text-white/60">
        This is what clients see when they search. You can add services and
        your schedule next.
      </p>

      <form action={formAction} className="mt-8 flex flex-col gap-4">
        {state?.error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
            {state.error}
          </p>
        )}
        <label className="flex flex-col gap-1 text-sm">
          Business / stylist name
          <input
            type="text"
            name="business_name"
            required
            placeholder="e.g. Salitan Hair Studio"
            className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Bio
          <textarea
            name="bio"
            rows={3}
            placeholder="Tell clients about your style and experience."
            className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            City
            <input
              type="text"
              name="city"
              required
              className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            State
            <input
              type="text"
              name="state"
              className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          Address
          <input
            type="text"
            name="address_line"
            placeholder="Street address (shown to booked clients)"
            className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>

        <fieldset className="flex flex-col gap-2 text-sm">
          <legend className="mb-1">Specialties</legend>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((s) => (
              <label
                key={s}
                className="flex items-center gap-2 rounded-full border border-black/15 px-3 py-1.5 has-checked:bg-foreground has-checked:text-background dark:border-white/20"
              >
                <input
                  type="checkbox"
                  name="specialties"
                  value={s}
                  className="sr-only"
                />
                {s}
              </label>
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-full bg-foreground px-4 py-2 text-background font-medium hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save and continue"}
        </button>
      </form>
    </div>
  );
}
