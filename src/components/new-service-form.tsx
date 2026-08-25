"use client";

import { useActionState, useRef, useEffect } from "react";
import { createService, type ActionState } from "@/lib/actions/stylist";

export function NewServiceForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createService,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-4 flex flex-col gap-3">
      {state?.error && <p className="alert-error">{state.error}</p>}
      <label className="flex flex-col gap-1 text-sm">
        Name
        <input
          type="text"
          name="name"
          required
          placeholder="e.g. Women's cut & style"
          className="input-glass"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Description
        <textarea name="description" rows={2} className="input-glass" />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Duration (minutes)
          <input
            type="number"
            name="duration_minutes"
            min={5}
            step={5}
            required
            defaultValue={45}
            className="input-glass"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Price (USD)
          <input
            type="number"
            name="price"
            min={0}
            step={1}
            required
            className="input-glass"
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="btn-primary mt-1 self-start !px-4 !py-2 text-sm"
      >
        {pending ? "Adding…" : "Add service"}
      </button>
    </form>
  );
}
