export type EventItem = {
  id: number;
  name: string;
  date: string;
  venue: string;
  description: string;
  totalTickets: number;
  bookedTickets: number;
  basePrice: string;
  currentPrice: string;
  floorPrice: string;
  ceilingPrice: string;
};

export type BookingItem = {
  id: number;
  eventId: number;
  userEmail: string;
  quantity: number;
  pricePaid: string;
  bookedAt: string;
};

export type PriceBreakdown = {
  timeAdjustment: number;
  demandAdjustment: number;
  inventoryAdjustment: number;
  weightedAdjustment: number;
  finalPrice: number;
};

const apiBaseUrl =
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${path} failed: ${response.status} ${text}`);
  }

  return (await response.json()) as T;
}

export function getEvents(): Promise<EventItem[]> {
  return request<EventItem[]>("/events");
}

export function getEventWithBreakdown(
  id: number
): Promise<{ event: EventItem; breakdown: PriceBreakdown }> {
  return request<{ event: EventItem; breakdown: PriceBreakdown }>(`/events/${id}`);
}

export function getBookingsByEvent(eventId: number): Promise<BookingItem[]> {
  return request<BookingItem[]>(`/bookings?eventId=${eventId}`);
}

export function formatMoney(value: number | string): string {
  const amount = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(value: string): string {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
