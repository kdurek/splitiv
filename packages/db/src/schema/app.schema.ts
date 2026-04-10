import { pgTable, text, timestamp, numeric, primaryKey, index } from "drizzle-orm/pg-core";

import { user } from "./auth.schema";

export const group = pgTable("group", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  adminId: text("admin_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const userGroup = pgTable(
  "user_group",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    groupId: text("group_id")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.groupId], name: "user_group_pkey" })],
);

export const expense = pgTable(
  "expense",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    groupId: text("group_id")
      .notNull()
      .references(() => group.id, { onDelete: "cascade" }),
    payerId: text("payer_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    amount: numeric("amount").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("expense_group_id_idx").on(table.groupId),
    index("expense_payer_id_idx").on(table.payerId),
  ],
);

export const expenseDebt = pgTable(
  "expense_debt",
  {
    id: text("id").primaryKey(),
    expenseId: text("expense_id")
      .notNull()
      .references(() => expense.id, { onDelete: "cascade" }),
    debtorId: text("debtor_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    amount: numeric("amount").notNull(),
    settled: numeric("settled").default("0").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("expense_debt_expense_id_idx").on(table.expenseId),
    index("expense_debt_debtor_id_idx").on(table.debtorId),
  ],
);

export const expenseLog = pgTable(
  "expense_log",
  {
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
  },
  (table) => [index("expense_log_debt_id_idx").on(table.debtId)],
);

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
  (table) => [index("push_subscription_user_id_idx").on(table.userId)],
);
