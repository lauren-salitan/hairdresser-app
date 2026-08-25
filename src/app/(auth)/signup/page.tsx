"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signUp, type AuthFormState } from "@/lib/actions/auth";
import { SubmitError } from "@/components/auth-form";

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(
    signUp,
    null
  );
  const [role, setRole] = useState<"client" | "stylist">("client");

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-display text-2xl font-semibold">Create your account</h1>
      <p className="mt-1 text-sm text-muted">
        Book appointments, or set up shop as a stylist.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-1 rounded-full border border-border-strong p-1">
        <button
          type="button"
          onClick={() => setRole("client")}
          className={role === "client" ? "pill-toggle-active" : "pill-toggle"}
        >
          I&apos;m booking
        </button>
        <button
          type="button"
          onClick={() => setRole("stylist")}
          className={role === "stylist" ? "pill-toggle-active" : "pill-toggle"}
        >
          I&apos;m a stylist
        </button>
      </div>

      <form action={formAction} className="mt-6 flex flex-col gap-4">
        <input type="hidden" name="role" value={role} />
        <SubmitError state={state} />
        <label className="flex flex-col gap-1 text-sm">
          Full name
          <input
            type="text"
            name="full_name"
            required
            className="input-glass"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input type="email" name="email" required className="input-glass" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            type="password"
            name="password"
            required
            minLength={8}
            className="input-glass"
          />
          <span className="text-xs text-muted-2">At least 8 characters.</span>
        </label>
        <button type="submit" disabled={pending} className="btn-primary mt-2">
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
