import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import * as allSchema from "@repo/db/schema";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../../../.."); // apps/web/src/test → monorepo root

export async function createTestDb() {
  const container = await new PostgreSqlContainer("postgres:18-alpine").start();
  const url = container.getConnectionUri();

  // Enable Postgres extensions required by the schema before pushing
  const setup = postgres(url, { max: 1 });
  await setup`CREATE EXTENSION IF NOT EXISTS pg_trgm`;
  await setup`CREATE EXTENSION IF NOT EXISTS unaccent`;
  await setup.end();

  // Push schema using drizzle-kit against the fresh container
  const result = spawnSync("pnpm", ["--filter", "@repo/db", "db", "push"], {
    cwd: ROOT,
    env: { ...process.env, DATABASE_URL: url },
    input: "\n", // auto-confirm any interactive prompts
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`drizzle-kit push failed:\nSTDOUT: ${result.stdout}\nSTDERR: ${result.stderr}`);
  }

  const { relations: _authRelations, ...tableSchema } = allSchema;
  const client = postgres(url);
  const db = drizzle({ client, schema: tableSchema, casing: "snake_case" });

  async function truncate() {
    await db.execute(
      // Truncate in dependency order; CASCADE handles any remaining FK refs
      `TRUNCATE "expense_log", "expense_debt", "expense", "user_group", "group",
               "session", "account", "verification", "push_subscription", "user" CASCADE`,
    );
  }

  async function cleanup() {
    await client.end();
    await container.stop();
  }

  return { db, truncate, cleanup, url };
}
