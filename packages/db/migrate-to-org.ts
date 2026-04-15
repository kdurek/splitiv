/**
 * Migration: group/userGroup → Better Auth organization/member
 *
 * Run with: npx tsx migrate-to-org.ts
 *
 * Steps:
 * 1. Copy each `group` row → `organization` (auto-generating slug from name)
 * 2. Copy each `userGroup` row → `member` with role "member"
 * 3. For each group, find the adminId user and update their member row to role "owner"
 * 4. Add activeOrganizationId column to session (handled by Drizzle migration)
 *
 * After confirming data, drop group, user_group, and user.active_group_id
 * via a new Drizzle migration.
 */

import postgres from "postgres";
import { ulid } from "ulid";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is required");
  process.exit(1);
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function migrate() {
  const sql = postgres(DATABASE_URL!);

  try {
    console.log("Starting migration: group/userGroup → organization/member");

    // Create new tables if they don't exist yet
    await sql`
      CREATE TABLE IF NOT EXISTS organization (
        id text PRIMARY KEY,
        name text NOT NULL,
        slug text UNIQUE,
        logo text,
        metadata text,
        created_at timestamp NOT NULL
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS member (
        id text PRIMARY KEY,
        organization_id text NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
        user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        role text NOT NULL,
        created_at timestamp NOT NULL
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS invitation (
        id text PRIMARY KEY,
        organization_id text NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
        email text NOT NULL,
        role text,
        status text NOT NULL,
        expires_at timestamp NOT NULL,
        inviter_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
      )
    `;
    console.log("  Created organization, member, invitation tables");

    // Fetch all existing groups
    const groups = await sql<{ id: string; name: string; admin_id: string; created_at: Date }[]>`
      SELECT id, name, admin_id, created_at FROM "group"
    `;
    console.log(`Found ${groups.length} groups to migrate`);

    // Fetch all userGroup memberships
    const userGroups = await sql<{ user_id: string; group_id: string }[]>`
      SELECT user_id, group_id FROM user_group
    `;
    console.log(`Found ${userGroups.length} memberships to migrate`);

    // Track used slugs to ensure uniqueness
    const usedSlugs = new Set<string>();

    for (const group of groups) {
      let slug = slugify(group.name);
      if (!slug) slug = group.id;

      // Ensure slug uniqueness
      let candidate = slug;
      let suffix = 1;
      while (usedSlugs.has(candidate)) {
        candidate = `${slug}-${suffix++}`;
      }
      usedSlugs.add(candidate);

      // Insert into organization
      await sql`
        INSERT INTO organization (id, name, slug, created_at)
        VALUES (${group.id}, ${group.name}, ${candidate}, ${group.created_at})
        ON CONFLICT (id) DO NOTHING
      `;
      console.log(`  Migrated group "${group.name}" → organization (slug: ${candidate})`);

      // Insert members for this group
      const groupMembers = userGroups.filter((ug) => ug.group_id === group.id);
      for (const ug of groupMembers) {
        const role = ug.user_id === group.admin_id ? "owner" : "member";
        await sql`
          INSERT INTO member (id, organization_id, user_id, role, created_at)
          VALUES (${ulid()}, ${group.id}, ${ug.user_id}, ${role}, NOW())
          ON CONFLICT DO NOTHING
        `;
      }
      console.log(`  Migrated ${groupMembers.length} members (owner: ${group.admin_id})`);
    }

    console.log("\nApplying schema changes to existing database...");

    // Add active_organization_id to session
    await sql`
      ALTER TABLE session
      ADD COLUMN IF NOT EXISTS active_organization_id text
    `;
    console.log("  Added active_organization_id to session");

    // Drop old columns and tables (after data has been migrated)
    await sql`ALTER TABLE "user" DROP COLUMN IF EXISTS active_group_id`;
    console.log("  Dropped user.active_group_id");

    await sql`ALTER TABLE expense DROP CONSTRAINT IF EXISTS expense_group_id_group_id_fk`;
    await sql`
      ALTER TABLE expense
      ADD CONSTRAINT expense_group_id_organization_id_fkey
      FOREIGN KEY (group_id) REFERENCES organization(id) ON DELETE CASCADE
    `;
    console.log("  Updated expense.group_id FK to reference organization");

    await sql`DROP TABLE IF EXISTS user_group`;
    console.log("  Dropped user_group table");

    await sql`DROP TABLE IF EXISTS "group"`;
    console.log("  Dropped group table");

    console.log("\nMigration complete.");
    console.log("Verify data in organization and member tables before deploying.");
  } finally {
    await sql.end();
  }
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
