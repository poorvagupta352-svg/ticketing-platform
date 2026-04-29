import "dotenv/config";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

const databaseUrl =
  process.env.NODE_ENV === "test"
    ? process.env.DATABASE_URL_TEST ?? process.env.DATABASE_URL
    : process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set (or DATABASE_URL_TEST for test mode)");
}

const client = postgres(databaseUrl, { max: 20 });

export const db = drizzle(client, { schema });
export { client };
export * from "./schema";
