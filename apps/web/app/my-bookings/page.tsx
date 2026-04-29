import Link from "next/link";

import { formatMoney, getBookingsByEvent, getEvents } from "../../lib/api";

type Props = {
  searchParams: Promise<{ email?: string }>;
};

export default async function MyBookingsPage({ searchParams }: Props) {
  const { email = "" } = await searchParams;
  const normalizedEmail = email.trim().toLowerCase();

  const events = await getEvents();
  const bookingsByEvent = await Promise.all(
    events.map(async (event) => ({
      event,
      bookings: await getBookingsByEvent(event.id),
    }))
  );

  const rows = bookingsByEvent
    .flatMap(({ event, bookings }) =>
      bookings
        .filter((booking) => !normalizedEmail || booking.userEmail.toLowerCase() === normalizedEmail)
        .map((booking) => ({
          booking,
          event,
        }))
    )
    .sort((a, b) => b.booking.id - a.booking.id);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">My Bookings</h1>
            <p className="mt-1 text-slate-300">Filter by email to find your purchases.</p>
          </div>
          <Link href="/events" className="text-sm text-indigo-300 hover:text-indigo-200">
            Back to events
          </Link>
        </div>

        <form action="/my-bookings" className="mb-6 flex gap-2">
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            defaultValue={email}
            className="w-full max-w-md rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium hover:bg-indigo-400"
          >
            Search
          </button>
        </form>

        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 text-slate-300">
              <tr>
                <th className="p-3">Event</th>
                <th className="p-3">Tickets</th>
                <th className="p-3">Paid</th>
                <th className="p-3">Current Price</th>
                <th className="p-3">Difference</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="p-4 text-slate-400" colSpan={5}>
                    No bookings found for this email.
                  </td>
                </tr>
              ) : (
                rows.map(({ booking, event }) => {
                  const paid = Number(booking.pricePaid);
                  const current = Number(event.currentPrice) * booking.quantity;
                  const delta = paid - current;
                  return (
                    <tr key={booking.id} className="border-b border-slate-800/70 last:border-b-0">
                      <td className="p-3">{event.name}</td>
                      <td className="p-3">{booking.quantity}</td>
                      <td className="p-3">{formatMoney(paid)}</td>
                      <td className="p-3">{formatMoney(current)}</td>
                      <td className={`p-3 ${delta >= 0 ? "text-emerald-300" : "text-amber-300"}`}>
                        {delta >= 0 ? "+" : "-"}
                        {formatMoney(Math.abs(delta))}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
