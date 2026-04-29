import { beforeEach } from "vitest";

import { db, bookings, events } from "@repo/database";

beforeEach(async () => {
  await db.delete(bookings);
  await db.delete(events);
});
