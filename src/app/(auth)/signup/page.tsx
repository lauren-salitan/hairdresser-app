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
      <h1 className="text-2xl font-semibold">Create your account</h1>
      <p className="mt-1 text-sm text-black/60 dark:text-white/60">
        Book appointments, or set up shop as a stylist.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-full border border-black/15 p-1 text-sm dark:border-white/20">
        <button
          type="button"
          onClick={() => setRole("client")}
          className={`rounded-full py-2 font-medium ${
            role === "client"
              ? "bg-foreground text-background"
              : "hover:bg-black/5 dark:hover:bg-white/10"
          }`}
        >
          I&apos;m booking
        </button>
        <button
          type="button"
          onClick={() => setRole("stylist")}
          className={`rounded-full py-2 font-medium ${
            role === "stylist"
              ? "bg-foreground text-background"
              : "hover:bg-black/5 dark:hover:bg-white/10"
          }`}
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
            className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>
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
            minLength={8}
            className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
          <span className="text-xs text-black/50 dark:text-white/50">
            At least 8 characters.
          </span>
        </label>
        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-full bg-foreground px-4 py-2 text-background font-medium hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-black/60 dark:text-white/60">
        Already have an account?{" "}
        <Link href="/login" className="underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
