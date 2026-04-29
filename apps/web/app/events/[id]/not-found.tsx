import Link from "next/link";

export default function EventNotFoundPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <section className="mx-auto max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h1 className="text-2xl font-semibold">Event not found</h1>
        <p className="mt-2 text-slate-300">
          This event may have been deleted or reset by seeding/testing. Pick another event from
          the list.
        </p>
        <Link
          href="/events"
          className="mt-5 inline-flex rounded-md bg-indigo-500 px-4 py-2 text-sm font-medium hover:bg-indigo-400"
        >
          Back to events
        </Link>
      </section>
    </main>
  );
}
