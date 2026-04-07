import { pgTable, text, timestamp, numeric, primaryKey, index } from "drizzle-orm/pg-core";

import { user } from "./auth.schema";

export const group = pgTable("group", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  name: text("name").notNull(),
  adminId: text("admin_id").notNull(),
});

export const userGroup = pgTable(
  "user_group",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    groupId: text("group_id")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.groupId] })],
);

export const expense = pgTable("expense", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  name: text("name").notNull(),
  description: text("description"),
  payerId: text("payer_id")
    .notNull()
    .references(() => user.id),
  amount: numeric("amount").notNull(),
  groupId: text("group_id")
    .notNull()
    .references(() => group.id, { onDelete: "cascade" }),
});

export const expenseDebt = pgTable("expense_debt", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  amount: numeric("amount").notNull(),
  settled: numeric("settled").default("0").notNull(),
  expenseId: text("expense_id")
    .notNull()
    .references(() => expense.id, { onDelete: "cascade" }),
  debtorId: text("debtor_id")
    .notNull()
    .references(() => user.id),
});

export const expenseLog = pgTable("expense_log", {
  id: text("id").primaryKey(),
  amount: numeric("amount").notNull(),
  debtId: text("debt_id")
    .notNull()
    .references(() => expenseDebt.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const pushSubscription = pgTable(
  "push_subscription",
  {
    endpoint: text("endpoint").primaryKey(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("push_subscription_userId_idx").on(table.userId)],
);
