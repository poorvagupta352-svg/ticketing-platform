import "dotenv/config";

import { and, desc, eq, gte, sql } from "drizzle-orm";
import express from "express";
import cors from "cors";
import { z } from "zod";
import { bookings, client, db, events } from "@repo/database";
import type { Express } from "express";

import { calculatePrice } from "./pricing";

const port = Number(process.env.PORT ?? 3001);
const adminApiKey = process.env.ADMIN_API_KEY ?? "dev-admin-key";

const weights = {
  time: Number(process.env.TIME_RULE_WEIGHT ?? 1),
  demand: Number(process.env.DEMAND_RULE_WEIGHT ?? 1),
  inventory: Number(process.env.INVENTORY_RULE_WEIGHT ?? 1),
};

const createEventSchema = z.object({
  name: z.string().min(1),
  date: z.string().datetime(),
  venue: z.string().min(1),
  description: z.string().min(1),
  totalTickets: z.number().int().positive(),
  basePrice: z.number().positive(),
  floorPrice: z.number().positive(),
  ceilingPrice: z.number().positive(),
});

const createBookingSchema = z.object({
  eventId: z.number().int().positive(),
  userEmail: z.string().email(),
  quantity: z.number().int().positive().max(10),
});

export function createApp(): Express {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/events", async (_req, res) => {
    const rows = await db.select().from(events).orderBy(events.date);
    res.json(rows);
  });

  app.get("/events/:id", async (req, res) => {
    const id = Number(req.params.id);
    const [event] = await db.select().from(events).where(eq(events.id, id));
    if (!event) return res.status(404).json({ message: "Event not found" });

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(and(eq(bookings.eventId, id), gte(bookings.bookedAt, oneHourAgo)));

    const breakdown = calculatePrice({
      basePrice: Number(event.basePrice),
      floorPrice: Number(event.floorPrice),
      ceilingPrice: Number(event.ceilingPrice),
      eventDate: event.date,
      totalTickets: event.totalTickets,
      bookedTickets: event.bookedTickets,
      bookingsLastHour: recentBookings.length,
      weights,
    });

    res.json({ event, breakdown });
  });

  app.post("/events", async (req, res) => {
    if (req.header("x-api-key") !== adminApiKey) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const parsed = createEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.flatten() });
    }

    const payload = parsed.data;
    const [inserted] = await db
      .insert(events)
      .values({
        ...payload,
        date: new Date(payload.date),
        bookedTickets: 0,
        currentPrice: payload.basePrice.toFixed(2),
        basePrice: payload.basePrice.toFixed(2),
        floorPrice: payload.floorPrice.toFixed(2),
        ceilingPrice: payload.ceilingPrice.toFixed(2),
        pricingConfig: {
          timeMultiplier: 1,
          demandMultiplier: 1,
          inventoryMultiplier: 1,
        },
      })
      .returning();

    res.status(201).json(inserted);
  });

  app.post("/bookings", async (req, res) => {
    const parsed = createBookingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.flatten() });
    }

    const { eventId, userEmail, quantity } = parsed.data;

    try {
      const result = await client.begin(async (tx) => {
        const locked = await tx<
          Array<{
            id: number;
            total_tickets: number;
            booked_tickets: number;
            base_price: string;
            floor_price: string;
            ceiling_price: string;
            date: Date;
          }>
        >`
        SELECT id, total_tickets, booked_tickets, base_price, floor_price, ceiling_price, date
        FROM events
        WHERE id = ${eventId}
        FOR UPDATE
      `;

        const event = locked[0];
        if (!event) throw new Error("EVENT_NOT_FOUND");

        const remaining = event.total_tickets - event.booked_tickets;
        if (remaining < quantity) throw new Error("INSUFFICIENT_TICKETS");

        const recent = await tx<Array<{ count: string }>>`
        SELECT COUNT(*)::text as count
        FROM bookings
        WHERE event_id = ${eventId}
          AND booked_at >= NOW() - INTERVAL '1 hour'
      `;

        const breakdown = calculatePrice({
          basePrice: Number(event.base_price),
          floorPrice: Number(event.floor_price),
          ceilingPrice: Number(event.ceiling_price),
          eventDate: new Date(event.date),
          totalTickets: event.total_tickets,
          bookedTickets: event.booked_tickets,
          bookingsLastHour: Number(recent[0]?.count ?? 0),
          weights,
        });

        const pricePaid = breakdown.finalPrice * quantity;
        const nextBooked = event.booked_tickets + quantity;

        await tx`
        UPDATE events
        SET booked_tickets = ${nextBooked},
            current_price = ${breakdown.finalPrice.toFixed(2)},
            updated_at = NOW()
        WHERE id = ${eventId}
      `;

        const insertedBooking = await tx<
          Array<{ id: number; event_id: number; user_email: string; quantity: number; price_paid: string }>
        >`
        INSERT INTO bookings (event_id, user_email, quantity, price_paid, booked_at)
        VALUES (${eventId}, ${userEmail}, ${quantity}, ${pricePaid.toFixed(2)}, NOW())
        RETURNING id, event_id, user_email, quantity, price_paid
      `;

        return insertedBooking[0];
      });

      res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error && error.message === "EVENT_NOT_FOUND") {
        return res.status(404).json({ message: "Event not found" });
      }
      if (error instanceof Error && error.message === "INSUFFICIENT_TICKETS") {
        return res.status(409).json({ message: "Not enough tickets available" });
      }
      return res.status(500).json({ message: "Booking failed", error });
    }
  });

  app.get("/bookings", async (req, res) => {
    const eventId = Number(req.query.eventId);
    if (!Number.isFinite(eventId)) {
      return res.status(400).json({ message: "eventId query is required" });
    }

    const rows = await db
      .select()
      .from(bookings)
      .where(eq(bookings.eventId, eventId))
      .orderBy(desc(bookings.bookedAt));
    res.json(rows);
  });

  app.get("/analytics/events/:id", async (req, res) => {
    const eventId = Number(req.params.id);

    const [event] = await db.select().from(events).where(eq(events.id, eventId));
    if (!event) return res.status(404).json({ message: "Event not found" });

    const [metrics] = await db
      .select({
        totalSold: sql<number>`COALESCE(SUM(${bookings.quantity}), 0)`,
        revenue: sql<string>`COALESCE(SUM(${bookings.pricePaid}), 0)`,
        averagePrice: sql<string>`COALESCE(AVG(${bookings.pricePaid}), 0)`,
      })
      .from(bookings)
      .where(eq(bookings.eventId, eventId));

    res.json({
      eventId,
      totalSold: Number(metrics?.totalSold ?? 0),
      revenue: Number(metrics?.revenue ?? 0),
      averagePrice: Number(metrics?.averagePrice ?? 0),
      remaining: event.totalTickets - event.bookedTickets,
    });
  });

  app.get("/analytics/summary", async (_req, res) => {
    const [summary] = await db
      .select({
        totalBookings: sql<number>`COUNT(${bookings.id})`,
        totalRevenue: sql<string>`COALESCE(SUM(${bookings.pricePaid}), 0)`,
        eventsCount: sql<number>`COUNT(DISTINCT ${events.id})`,
      })
      .from(events)
      .leftJoin(bookings, eq(events.id, bookings.eventId));

    res.json({
      totalBookings: Number(summary?.totalBookings ?? 0),
      totalRevenue: Number(summary?.totalRevenue ?? 0),
      eventsCount: Number(summary?.eventsCount ?? 0),
    });
  });

  app.post("/seed", async (_req, res) => {
    await db.delete(bookings);
    await db.delete(events);

    const now = new Date();
    const dayMs = 24 * 60 * 60 * 1000;
    const [seeded] = await db
      .insert(events)
      .values({
        name: "Seeded API Event",
        date: new Date(now.getTime() + 14 * dayMs),
        venue: "Main Hall",
        description: "Generated from /seed endpoint",
        totalTickets: 200,
        bookedTickets: 0,
        basePrice: "799.00",
        currentPrice: "799.00",
        floorPrice: "499.00",
        ceilingPrice: "1299.00",
        pricingConfig: {
          timeMultiplier: 1,
          demandMultiplier: 1,
          inventoryMultiplier: 1,
        },
      })
      .returning();

    res.status(201).json({ event: seeded });
  });

  return app;
}

const app = createApp();

if (require.main === module) {
  app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
  });
}
