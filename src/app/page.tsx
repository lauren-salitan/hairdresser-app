import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="flex flex-col items-start gap-6 py-24">
        <h1 className="font-display max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
          Book your next <span className="text-gradient">haircut</span> with
          someone who gets it right.
        </h1>
        <p className="max-w-xl text-lg text-muted">
          Search stylists by specialty, location, and availability, then book
          and pay in a few taps. Stylists get a dashboard to manage bookings
          and get paid straight to their account.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/browse" className="btn-primary">
            Find a stylist
          </Link>
          <Link href="/signup" className="btn-secondary">
            I&apos;m a stylist
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-5 border-t border-border py-16 sm:grid-cols-3">
        <div className="card-glass">
          <h2 className="font-display font-semibold">Search &amp; filter</h2>
          <p className="mt-2 text-sm text-muted">
            Filter by specialty, city, and open time slots to find the right
            stylist fast.
          </p>
        </div>
        <div className="card-glass">
          <h2 className="font-display font-semibold">Book &amp; pay</h2>
          <p className="mt-2 text-sm text-muted">
            Pick a service and a time, then pay securely when you book.
          </p>
        </div>
        <div className="card-glass">
          <h2 className="font-display font-semibold">Manage from a dashboard</h2>
          <p className="mt-2 text-sm text-muted">
            Stylists track bookings, set availability, and get paid out —
            clients keep every appointment in one place.
          </p>
        </div>
      </section>
    </div>
  );
}
