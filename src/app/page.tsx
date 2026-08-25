import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="flex flex-col items-start gap-6 py-24">
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Book your next haircut with someone who gets it right.
        </h1>
        <p className="max-w-xl text-lg text-black/70 dark:text-white/70">
          Search stylists by specialty, location, and availability, then book
          and pay in a few taps. Stylists get a dashboard to manage bookings
          and get paid straight to their account.
        </p>
        <div className="flex gap-3">
          <Link
            href="/browse"
            className="rounded-full bg-foreground px-6 py-3 text-background font-medium hover:opacity-90"
          >
            Find a stylist
          </Link>
          <Link
            href="/signup"
            className="rounded-full border border-black/15 px-6 py-3 font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            I&apos;m a stylist
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 border-t border-black/10 py-16 sm:grid-cols-3 dark:border-white/10">
        <div>
          <h2 className="font-semibold">Search &amp; filter</h2>
          <p className="mt-2 text-sm text-black/70 dark:text-white/70">
            Filter by specialty, city, and open time slots to find the right
            stylist fast.
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Book &amp; pay</h2>
          <p className="mt-2 text-sm text-black/70 dark:text-white/70">
            Pick a service and a time, then pay securely when you book.
          </p>
        </div>
        <div>
          <h2 className="font-semibold">Manage from a dashboard</h2>
          <p className="mt-2 text-sm text-black/70 dark:text-white/70">
            Stylists track bookings, set availability, and get paid out —
            clients keep every appointment in one place.
          </p>
        </div>
      </section>
    </div>
  );
}
