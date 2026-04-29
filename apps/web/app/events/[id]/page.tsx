import Link from "next/link";
import { notFound } from "next/navigation";

import { createBookingAction } from "./actions";
import PricePoll from "./price-poll";
import { ApiError, formatDate, formatMoney, getEventWithBreakdown } from "../../../lib/api";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
};

function getErrorText(error?: string): string | null {
  if (!error) return null;
  if (error === "sold-out") return "Not enough tickets available.";
  if (error === "invalid-input") return "Please enter a valid email and quantity.";
  return "Booking failed. Please try again.";
}

export default async function EventDetailsPage({ params, searchParams }: Props) {
  const { id } = await params;
  const eventId = Number(id);
  const query = await searchParams;

  let eventData: Awaited<ReturnType<typeof getEventWithBreakdown>>;
  try {
    eventData = await getEventWithBreakdown(eventId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const { event, breakdown } = eventData;
  const remaining = event.totalTickets - event.bookedTickets;
  const errorText = getErrorText(query.error);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <section className="mx-auto grid max-w-5xl gap-6 md:grid-cols-[1fr_360px]">
        <article className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-6">
          <Link href="/events" className="text-sm text-indigo-300 hover:text-indigo-200">
            ← Back to events
          </Link>
          <h1 className="text-3xl font-semibold">{event.name}</h1>
          <p className="text-slate-300">{event.description}</p>
          <div className="grid gap-2 text-sm text-slate-300">
            <p>Date: {formatDate(event.date)}</p>
            <p>Venue: {event.venue}</p>
            <p>
              Remaining tickets: <span className="font-semibold">{remaining}</span>
            </p>
            <p>Base price: {formatMoney(event.basePrice)}</p>
          </div>
          <PricePoll eventId={event.id} initialBreakdown={breakdown} />
        </article>

        <aside className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Book Tickets</h2>
          <p className="mt-2 text-sm text-slate-300">
            Pay current price: <span className="font-semibold">{formatMoney(event.currentPrice)}</span>
          </p>
          {errorText ? (
            <p className="mt-3 rounded-md border border-rose-500/40 bg-rose-900/30 p-2 text-sm text-rose-200">
              {errorText}
            </p>
          ) : null}
          <form
            action={createBookingAction.bind(null, event.id)}
            className="mt-5 space-y-3"
          >
            <div className="space-y-1">
              <label htmlFor="userEmail" className="block text-sm text-slate-300">
                Email
              </label>
              <input
                id="userEmail"
                name="userEmail"
                type="email"
                required
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="quantity" className="block text-sm text-slate-300">
                Quantity
              </label>
              <input
                id="quantity"
                name="quantity"
                type="number"
                min={1}
                max={10}
                defaultValue={1}
                required
                className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium hover:bg-indigo-400"
            >
              Confirm Booking
            </button>
          </form>
        </aside>
      </section>
    </main>
  );
}
