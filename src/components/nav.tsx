import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/actions/auth";

export async function Nav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: "client" | "stylist" | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role ?? null;
  }

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-background/70 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-gradient"
        >
          Chairside
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/browse" className="nav-link">
            Find a stylist
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="nav-link">
                {role === "stylist" ? "My dashboard" : "My bookings"}
              </Link>
              <form action={signOut}>
                <button type="submit" className="nav-link cursor-pointer">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Sign in
              </Link>
              <Link href="/signup" className="btn-primary !px-4 !py-1.5 text-sm">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
