import Link from "next/link";

import { formatMoney } from "../../../lib/api";

type Props = {
  searchParams: Promise<{
    bookingId?: string;
    eventId?: string;
    userEmail?: string;
    quantity?: string;
    totalPaid?: string;
  }>;
};

export default async function BookingSuccessPage({ searchParams }: Props) {
  const params = await searchParams;
  const total = Number(params.totalPaid ?? 0);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <section className="mx-auto max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-3xl font-semibold">Booking Confirmed</h1>
        <p className="mt-2 text-slate-300">Your booking has been created successfully.</p>

        <div className="mt-6 grid gap-2 text-sm text-slate-300">
          <p>Booking ID: {params.bookingId ?? "-"}</p>
          <p>Event ID: {params.eventId ?? "-"}</p>
          <p>Email: {params.userEmail ?? "-"}</p>
          <p>Tickets: {params.quantity ?? "-"}</p>
          <p className="font-medium text-slate-100">Total Paid: {formatMoney(total)}</p>
        </div>

        <div className="mt-6 flex gap-3">
          <Link
            href="/events"
            className="rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium hover:bg-indigo-400"
          >
            Book More
          </Link>
          <Link
            href={`/my-bookings?email=${encodeURIComponent(params.userEmail ?? "")}`}
            className="rounded-md border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
          >
            View My Bookings
          </Link>
        </div>
      </section>
    </main>
  );
}
