import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-16">
      <section className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-semibold tracking-tight">Event Ticketing Platform</h1>
        <p className="text-slate-300 text-lg">
          Dynamic pricing, booking, and analytics are now wired with Next.js + Express +
          PostgreSQL.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/events"
            className="inline-flex rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium hover:bg-indigo-400"
          >
            View Events
          </Link>
          <Link
            href="/my-bookings"
            className="inline-flex rounded-md border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-900"
          >
            My Bookings
          </Link>
        </div>
      </section>
    </main>
  );
}
