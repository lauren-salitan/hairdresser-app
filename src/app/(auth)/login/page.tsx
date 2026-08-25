"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signIn, type AuthFormState } from "@/lib/actions/auth";
import { SubmitError } from "@/components/auth-form";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signIn,
    null
  );

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-2xl font-semibold">Welcome back</h1>
      <p className="mt-1 text-sm text-black/60 dark:text-white/60">
        Sign in to book or manage your appointments.
      </p>

      <form action={formAction} className="mt-8 flex flex-col gap-4">
        <SubmitError state={state} />
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            type="email"
            name="email"
            required
            className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            type="password"
            name="password"
            required
            className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-full bg-foreground px-4 py-2 text-background font-medium hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-sm text-black/60 dark:text-white/60">
        No account yet?{" "}
        <Link href="/signup" className="underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
