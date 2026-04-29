import Link from "next/link";

import { formatDate, formatMoney, getEvents } from "../../lib/api";

export const revalidate = 0;

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <section className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Upcoming Events</h1>
            <p className="mt-2 text-slate-300">Live pricing and inventory from the API.</p>
          </div>
          <Link href="/my-bookings" className="text-sm text-indigo-300 hover:text-indigo-200">
            Go to My Bookings
          </Link>
        </div>

        <div className="grid gap-4">
          {events.map((event) => {
            const remaining = event.totalTickets - event.bookedTickets;
            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-slate-700"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl font-medium">{event.name}</h2>
                    <p className="text-sm text-slate-300">{event.venue}</p>
                    <p className="text-sm text-slate-400">{formatDate(event.date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{formatMoney(event.currentPrice)}</p>
                    <p className="text-sm text-slate-300">{remaining} tickets left</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
