import { pgTable, text, timestamp, numeric, index } from "drizzle-orm/pg-core";

import { organization, user } from "./auth.schema";

export const expense = pgTable(
  "expense",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    groupId: text("group_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
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
    index("expense_name_trgm_idx").using("gin", table.name.op("gin_trgm_ops")),
    index("expense_description_trgm_idx").using("gin", table.description.op("gin_trgm_ops")),
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
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("push_subscription_user_id_idx").on(table.userId)],
);

export const notification = pgTable(
  "notification",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    expenseId: text("expense_id").references(() => expense.id, { onDelete: "set null" }),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("notification_user_id_idx").on(table.userId),
    index("notification_user_org_idx").on(table.userId, table.organizationId),
    index("notification_user_unread_idx").on(table.userId, table.readAt),
  ],
);
