import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const examples = pgTable("examples", {
  id: uuid("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
