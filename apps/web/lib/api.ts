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

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const apiBaseUrl =
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

const REQUEST_TIMEOUT_MS = 8000;
const MAX_RETRIES = 1;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= MAX_RETRIES) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${apiBaseUrl}${path}`, {
        ...init,
        cache: "no-store",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(init?.headers ?? {}),
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new ApiError(response.status, `API ${path} failed: ${response.status} ${text}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
      if (attempt >= MAX_RETRIES) break;
      await sleep(250);
      attempt += 1;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error ? lastError : new Error(`API ${path} failed unexpectedly`);
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
