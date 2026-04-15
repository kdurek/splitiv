/**
 * Migrates all primary keys and foreign keys to ULID format.
 *
 * Run with:
 *   cd packages/db && npx tsx migrate-to-ulid.ts
 *
 * The script seeds each ULID from the row's created_at timestamp so the
 * time component reflects the original creation time.
 *
 * Tables with no own id column (user_group, push_subscription) are not
 * migrated — only their FK reference columns are rewritten.
 */

process.loadEnvFile(new URL(".env", import.meta.url));

import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { ulid } from "ulid";

import {
  user,
  session,
  account,
  verification,
  expense,
  expenseDebt,
  expenseLog,
} from "./src/schema/index.js";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle({ client });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type IdMap = Map<string, string>; // oldId → newId

/** Builds a Map<oldId, newId> using the row's createdAt as the ULID seed. */
function buildMap(rows: { id: string; createdAt: Date }[]): IdMap {
  return new Map(rows.map((r) => [r.id, ulid(r.createdAt.getTime())]));
}

/**
 * Bulk-updates a single column across a table using a SQL VALUES list.
 * One round-trip per call regardless of row count.
 */
async function bulkUpdate(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  table: string,
  column: string,
  map: IdMap,
) {
  if (map.size === 0) return;

  const pairs = [...map.entries()].map(([oldId, newId]) => sql`(${oldId}::text, ${newId}::text)`);

  await tx.execute(
    sql`UPDATE ${sql.raw(`"${table}"`)} t
        SET    ${sql.raw(`"${column}"`)} = v.new_id
        FROM   (VALUES ${sql.join(pairs, sql`, `)}) AS v(old_id, new_id)
        WHERE  t.${sql.raw(`"${column}"`)} = v.old_id`,
  );
}

// ---------------------------------------------------------------------------
// Migration
// ---------------------------------------------------------------------------

async function main() {
  console.log("Fetching existing IDs…");

  // Read everything we need before opening the transaction.
  const [users, groups, expenses, debts, logs, sessions, accounts, verifications] =
    await Promise.all([
      db.select({ id: user.id, createdAt: user.createdAt }).from(user),
      // group table was removed in the org refactor migration
      Promise.resolve([] as { id: string; createdAt: Date }[]),
      db.select({ id: expense.id, createdAt: expense.createdAt }).from(expense),
      db.select({ id: expenseDebt.id, createdAt: expenseDebt.createdAt }).from(expenseDebt),
      db.select({ id: expenseLog.id, createdAt: expenseLog.createdAt }).from(expenseLog),
      db.select({ id: session.id, createdAt: session.createdAt }).from(session),
      db.select({ id: account.id, createdAt: account.createdAt }).from(account),
      db.select({ id: verification.id, createdAt: verification.createdAt }).from(verification),
    ]);

  // Build old → new ULID maps (seeded by createdAt).
  const userMap = buildMap(users);
  const groupMap = buildMap(groups);
  const expenseMap = buildMap(expenses);
  const debtMap = buildMap(debts);
  const logMap = buildMap(logs);
  const sessionMap = buildMap(sessions);
  const accountMap = buildMap(accounts);
  const verificationMap = buildMap(verifications);

  console.log(
    `Migrating: ${userMap.size} users, ${groupMap.size} groups, ` +
      `${expenseMap.size} expenses, ${debtMap.size} debts, ${logMap.size} logs, ` +
      `${sessionMap.size} sessions, ${accountMap.size} accounts, ${verificationMap.size} verifications`,
  );

  await db.transaction(async (tx) => {
    // -----------------------------------------------------------------------
    // 1. Drop all FK constraints and the user_group composite PK
    // -----------------------------------------------------------------------
    console.log("Dropping FK constraints…");
    await tx.execute(
      sql`ALTER TABLE "account"           DROP CONSTRAINT "account_user_id_user_id_fk"`,
    );
    await tx.execute(
      sql`ALTER TABLE "session"           DROP CONSTRAINT "session_user_id_user_id_fk"`,
    );
    await tx.execute(
      sql`ALTER TABLE "expense"           DROP CONSTRAINT "expense_group_id_group_id_fk"`,
    );
    await tx.execute(
      sql`ALTER TABLE "expense"           DROP CONSTRAINT "expense_payer_id_user_id_fk"`,
    );
    await tx.execute(
      sql`ALTER TABLE "expense_debt"      DROP CONSTRAINT "expense_debt_expense_id_expense_id_fk"`,
    );
    await tx.execute(
      sql`ALTER TABLE "expense_debt"      DROP CONSTRAINT "expense_debt_debtor_id_user_id_fk"`,
    );
    await tx.execute(
      sql`ALTER TABLE "expense_log"       DROP CONSTRAINT "expense_log_debt_id_expense_debt_id_fk"`,
    );
    await tx.execute(
      sql`ALTER TABLE "push_subscription" DROP CONSTRAINT "push_subscription_user_id_user_id_fk"`,
    );
    await tx.execute(
      sql`ALTER TABLE "user_group"        DROP CONSTRAINT "user_group_user_id_user_id_fk"`,
    );
    await tx.execute(
      sql`ALTER TABLE "user_group"        DROP CONSTRAINT "user_group_group_id_group_id_fk"`,
    );
    await tx.execute(sql`ALTER TABLE "user_group"        DROP CONSTRAINT "user_group_pkey"`);

    // -----------------------------------------------------------------------
    // 2. Rewrite FK reference columns
    // -----------------------------------------------------------------------
    console.log("Updating FK reference columns…");
    await bulkUpdate(tx, "session", "user_id", userMap);
    await bulkUpdate(tx, "account", "user_id", userMap);
    await bulkUpdate(tx, "user_group", "user_id", userMap);
    await bulkUpdate(tx, "user_group", "group_id", groupMap);
    await bulkUpdate(tx, "expense", "group_id", groupMap);
    await bulkUpdate(tx, "expense", "payer_id", userMap);
    await bulkUpdate(tx, "expense_debt", "expense_id", expenseMap);
    await bulkUpdate(tx, "expense_debt", "debtor_id", userMap);
    await bulkUpdate(tx, "expense_log", "debt_id", debtMap);
    await bulkUpdate(tx, "push_subscription", "user_id", userMap);
    // Plain text columns (no FK constraint)
    await bulkUpdate(tx, "group", "admin_id", userMap);
    await bulkUpdate(tx, "user", "active_group_id", groupMap);

    // -----------------------------------------------------------------------
    // 3. Swap PKs: rename id → _old_id, new_id column or direct UPDATE
    //    Strategy: UPDATE id in-place now that FKs are gone, using the map.
    // -----------------------------------------------------------------------
    console.log("Swapping primary keys…");
    await bulkUpdate(tx, "user", "id", userMap);
    await bulkUpdate(tx, "group", "id", groupMap);
    await bulkUpdate(tx, "expense", "id", expenseMap);
    await bulkUpdate(tx, "expense_debt", "id", debtMap);
    await bulkUpdate(tx, "expense_log", "id", logMap);
    await bulkUpdate(tx, "session", "id", sessionMap);
    await bulkUpdate(tx, "account", "id", accountMap);
    await bulkUpdate(tx, "verification", "id", verificationMap);

    // -----------------------------------------------------------------------
    // 4. Recreate user_group composite PK and all FK constraints
    // -----------------------------------------------------------------------
    console.log("Recreating constraints…");
    await tx.execute(
      sql`ALTER TABLE "user_group" ADD CONSTRAINT "user_group_pkey" PRIMARY KEY ("user_id", "group_id")`,
    );

    await tx.execute(
      sql`ALTER TABLE "account"           ADD CONSTRAINT "account_user_id_user_id_fk"             FOREIGN KEY ("user_id")    REFERENCES "user"("id")         ON DELETE CASCADE`,
    );
    await tx.execute(
      sql`ALTER TABLE "session"           ADD CONSTRAINT "session_user_id_user_id_fk"             FOREIGN KEY ("user_id")    REFERENCES "user"("id")         ON DELETE CASCADE`,
    );
    await tx.execute(
      sql`ALTER TABLE "expense"           ADD CONSTRAINT "expense_group_id_group_id_fk"           FOREIGN KEY ("group_id")   REFERENCES "group"("id")        ON DELETE CASCADE`,
    );
    await tx.execute(
      sql`ALTER TABLE "expense"           ADD CONSTRAINT "expense_payer_id_user_id_fk"            FOREIGN KEY ("payer_id")   REFERENCES "user"("id")         ON DELETE RESTRICT`,
    );
    await tx.execute(
      sql`ALTER TABLE "expense_debt"      ADD CONSTRAINT "expense_debt_expense_id_expense_id_fk"  FOREIGN KEY ("expense_id") REFERENCES "expense"("id")      ON DELETE CASCADE`,
    );
    await tx.execute(
      sql`ALTER TABLE "expense_debt"      ADD CONSTRAINT "expense_debt_debtor_id_user_id_fk"      FOREIGN KEY ("debtor_id")  REFERENCES "user"("id")         ON DELETE RESTRICT`,
    );
    await tx.execute(
      sql`ALTER TABLE "expense_log"       ADD CONSTRAINT "expense_log_debt_id_expense_debt_id_fk" FOREIGN KEY ("debt_id")    REFERENCES "expense_debt"("id") ON DELETE CASCADE`,
    );
    await tx.execute(
      sql`ALTER TABLE "push_subscription" ADD CONSTRAINT "push_subscription_user_id_user_id_fk"   FOREIGN KEY ("user_id")    REFERENCES "user"("id")         ON DELETE CASCADE`,
    );
    await tx.execute(
      sql`ALTER TABLE "user_group"        ADD CONSTRAINT "user_group_user_id_user_id_fk"          FOREIGN KEY ("user_id")    REFERENCES "user"("id")         ON DELETE RESTRICT`,
    );
    await tx.execute(
      sql`ALTER TABLE "user_group"        ADD CONSTRAINT "user_group_group_id_group_id_fk"        FOREIGN KEY ("group_id")   REFERENCES "group"("id")        ON DELETE CASCADE`,
    );
  });

  console.log("Done. All IDs migrated to ULID.");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
