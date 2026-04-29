import {
  integer,
  jsonb,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  date: timestamp("date", { withTimezone: true }).notNull(),
  venue: varchar("venue", { length: 255 }).notNull(),
  description: text("description").notNull(),
  totalTickets: integer("total_tickets").notNull(),
  bookedTickets: integer("booked_tickets").notNull().default(0),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  currentPrice: numeric("current_price", { precision: 10, scale: 2 }).notNull(),
  floorPrice: numeric("floor_price", { precision: 10, scale: 2 }).notNull(),
  ceilingPrice: numeric("ceiling_price", { precision: 10, scale: 2 }).notNull(),
  pricingConfig: jsonb("pricing_config").$type<{
    timeMultiplier: number;
    demandMultiplier: number;
    inventoryMultiplier: number;
  }>(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  userEmail: varchar("user_email", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  pricePaid: numeric("price_paid", { precision: 10, scale: 2 }).notNull(),
  bookedAt: timestamp("booked_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
