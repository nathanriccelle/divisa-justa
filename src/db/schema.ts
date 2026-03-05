import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// TABELA DE EVENTOS (A conta principal: Churrasco, Viagem...)
export const events = sqliteTable("events", {
  // id
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  currencySymbol: text("currency_symbol").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// TABELA DE PARTICIPANTES (As pessoas que estão dentro de cada evento)
export const participants = sqliteTable("participants", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  initials: text("initials").notNull(),
  isOwner: integer("is_owner", { mode: "boolean" }).notNull().default(false),
});

// TABELA DE DESPESAS (Batata Frita, Gasolina...)
export const expenses = sqliteTable("expenses", {
  id: text("id").primaryKey(),
  eventId: text("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  payerId: text("payer_id")
    .notNull()
    .references(() => participants.id, { onDelete: "cascade" }),

  title: text("title").notNull(),
  amount: real("amount").notNull(),
  quantity: integer("quantity").notNull().default(1),
  date: integer("date", { mode: "timestamp" }).notNull(),
  splitWithIds: text("split_with_ids").notNull(),
});
