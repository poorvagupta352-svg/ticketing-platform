"use server";

import { redirect } from "next/navigation";

const apiBaseUrl =
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export async function createBookingAction(eventId: number, formData: FormData) {
  const userEmail = String(formData.get("userEmail") ?? "").trim();
  const quantity = Number(formData.get("quantity"));

  if (!userEmail || !Number.isFinite(quantity) || quantity < 1) {
    redirect(`/events/${eventId}?error=invalid-input`);
  }

  const response = await fetch(`${apiBaseUrl}/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventId, userEmail, quantity }),
    cache: "no-store",
  });

  if (!response.ok) {
    const reason = response.status === 409 ? "sold-out" : "booking-failed";
    redirect(`/events/${eventId}?error=${reason}`);
  }

  const booking = (await response.json()) as {
    id: number;
    event_id: number;
    user_email: string;
    quantity: number;
    price_paid: string;
  };

  const params = new URLSearchParams({
    bookingId: String(booking.id),
    eventId: String(booking.event_id),
    userEmail: booking.user_email,
    quantity: String(booking.quantity),
    totalPaid: booking.price_paid,
  });

  redirect(`/bookings/success?${params.toString()}`);
}
