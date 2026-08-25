"use client";

import { useActionState } from "react";
import type { AuthFormState } from "@/lib/actions/auth";

export function SubmitError({ state }: { state: AuthFormState }) {
  if (!state?.error) return null;
  return <p className="alert-error">{state.error}</p>;
}

export function useAuthForm(
  action: (state: AuthFormState, formData: FormData) => Promise<AuthFormState>
) {
  return useActionState(action, null);
}
