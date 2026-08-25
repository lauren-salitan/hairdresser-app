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
      <h1 className="font-display text-2xl font-semibold">
        Set up your stylist profile
      </h1>
      <p className="mt-1 text-sm text-muted">
        This is what clients see when they search. You can add services and
        your schedule next.
      </p>

      <form action={formAction} className="mt-8 flex flex-col gap-4">
        {state?.error && <p className="alert-error">{state.error}</p>}
        <label className="flex flex-col gap-1 text-sm">
          Business / stylist name
          <input
            type="text"
            name="business_name"
            required
            placeholder="e.g. Salitan Hair Studio"
            className="input-glass"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Bio
          <textarea
            name="bio"
            rows={3}
            placeholder="Tell clients about your style and experience."
            className="input-glass"
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            City
            <input type="text" name="city" required className="input-glass" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            State
            <input type="text" name="state" className="input-glass" />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          Address
          <input
            type="text"
            name="address_line"
            placeholder="Street address (shown to booked clients)"
            className="input-glass"
          />
        </label>

        <fieldset className="flex flex-col gap-2 text-sm">
          <legend className="mb-1">Specialties</legend>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((s) => (
              <label key={s} className="specialty-pill">
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

        <button type="submit" disabled={pending} className="btn-primary mt-2">
          {pending ? "Saving…" : "Save and continue"}
        </button>
      </form>
    </div>
  );
}
