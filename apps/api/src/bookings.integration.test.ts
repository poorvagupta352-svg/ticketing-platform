import request from "supertest";
import { describe, expect, it } from "vitest";

import { db, bookings, events } from "@repo/database";
import { eq } from "drizzle-orm";

import { createApp } from "./server";

async function createEvent(totalTickets: number) {
  const [event] = await db
    .insert(events)
    .values({
      name: "Integration Event",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      venue: "Integration Hall",
      description: "Event for integration tests",
      totalTickets,
      bookedTickets: 0,
      basePrice: "1000.00",
      currentPrice: "1000.00",
      floorPrice: "700.00",
      ceilingPrice: "2000.00",
      pricingConfig: {
        timeMultiplier: 1,
        demandMultiplier: 1,
        inventoryMultiplier: 1,
      },
    })
    .returning();

  return event;
}

describe("Bookings API integration", () => {
  const app = createApp();

  it("completes booking flow and updates inventory", async () => {
    const event = await createEvent(10);

    const response = await request(app).post("/bookings").send({
      eventId: event.id,
      userEmail: "tester@example.com",
      quantity: 2,
    });

    expect(response.status).toBe(201);
    expect(response.body.quantity).toBe(2);

    const [updatedEvent] = await db.select().from(events).where(eq(events.id, event.id));
    expect(updatedEvent?.bookedTickets).toBe(2);

    const rows = await db.select().from(bookings).where(eq(bookings.eventId, event.id));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.userEmail).toBe("tester@example.com");
  });

  it("prevents overbooking with concurrent requests", async () => {
    const event = await createEvent(1);

    const payloadA = {
      eventId: event.id,
      userEmail: "first@example.com",
      quantity: 1,
    };
    const payloadB = {
      eventId: event.id,
      userEmail: "second@example.com",
      quantity: 1,
    };

    const [first, second] = await Promise.all([
      request(app).post("/bookings").send(payloadA),
      request(app).post("/bookings").send(payloadB),
    ]);

    const statuses = [first.status, second.status].sort();
    expect(statuses).toEqual([201, 409]);

    const [updatedEvent] = await db.select().from(events).where(eq(events.id, event.id));
    expect(updatedEvent?.bookedTickets).toBe(1);

    const rows = await db.select().from(bookings).where(eq(bookings.eventId, event.id));
    expect(rows).toHaveLength(1);
  });
});
