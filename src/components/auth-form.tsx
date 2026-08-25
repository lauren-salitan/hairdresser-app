"use client";

import { useActionState } from "react";
import type { AuthFormState } from "@/lib/actions/auth";

export function SubmitError({ state }: { state: AuthFormState }) {
  if (!state?.error) return null;
  return (
    <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
      {state.error}
    </p>
  );
}

export function useAuthForm(
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>
) {
  return useActionState(action, null);
}
