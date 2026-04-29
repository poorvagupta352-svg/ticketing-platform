## Design Overview

This implementation uses a Turborepo monorepo with three main runtime pieces: a Next.js frontend in `apps/web`, an Express API in `apps/api`, and a shared Drizzle/PostgreSQL package in `packages/database`. The shared database package keeps schema, connection, and seed logic in one place so both the API runtime and tests use the same definitions and SQL shape. This reduces drift between development and testing.

The pricing algorithm is implemented in `apps/api/src/pricing.ts` as a deterministic pure function: `calculatePrice(input)`. It computes three adjustments (time, demand, inventory), applies configurable weights, and calculates final price with:

`currentPrice = basePrice * (1 + weightedAdjustment)`

The function then clamps price to the configured floor and ceiling, ensuring business safety. Keeping pricing logic pure (no DB access, no side effects) makes unit testing straightforward and stable. The API uses this function both for event detail breakdown (`GET /events/:id`) and during booking creation (`POST /bookings`), ensuring a single source of truth for pricing behavior.

The concurrency problem is solved inside a transaction with row-level locking in `POST /bookings`. The API starts a DB transaction and executes `SELECT ... FOR UPDATE` on the target event row. This serializes concurrent booking attempts for the same event. After lock acquisition, the handler recomputes remaining inventory and rejects with `409` when insufficient tickets remain. On success, it updates `booked_tickets` and inserts the booking atomically before commit. This design prevents overselling even when two requests race for the last ticket.

Testing is split by concern:

- Unit tests for pricing verify each rule, weighted combination behavior, and floor/ceiling constraints.
- Integration tests use Supertest against the Express app and the real PostgreSQL database.
- A dedicated concurrency test sends parallel booking requests against an event with one ticket and asserts exactly one success and one failure, then verifies DB state (`booked_tickets = 1`, exactly one booking row).

Architecture trade-offs: the current service keeps code in a single API module for speed of delivery and assignment clarity. A production hardening pass would extract route modules, service layer, repository layer, and centralized error middleware. The frontend currently polls every 30 seconds for detail-page pricing updates; this keeps complexity low but can be upgraded to server-sent events or websockets for lower latency and efficiency.

Given more time, I would add stricter schema constraints (check constraints for non-negative ticket counts), richer analytics, request-level idempotency keys for booking retries, and role-based auth for admin endpoints. I would also add Docker Compose for full monorepo startup and CI workflows to enforce migrations, tests, and linting on every change.
