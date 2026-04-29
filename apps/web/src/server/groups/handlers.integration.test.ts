import { member, organization, user } from "@repo/db/schema";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { createTestDb } from "../../test/db";
import { addMemberByEmailHandler, getGroupsDataHandler } from "./handlers";

const U1 = "user-alice";
const U2 = "user-bob";
const U3 = "user-charlie";
const G1 = "group-main";
const G2 = "group-second";

type TestDb = Awaited<ReturnType<typeof createTestDb>>["db"];

let db: TestDb;
let truncate: () => Promise<void>;
let cleanup: () => Promise<void>;

beforeAll(async () => {
  ({ db, truncate, cleanup } = await createTestDb());
}, 60_000);

afterAll(async () => {
  await cleanup();
});

beforeEach(async () => {
  await truncate();

  await db.insert(user).values([
    { id: U1, name: "Alice", email: "alice@test.com", emailVerified: true },
    { id: U2, name: "Bob", email: "bob@test.com", emailVerified: true },
    { id: U3, name: "Charlie", email: "charlie@test.com", emailVerified: true },
  ]);
  await db.insert(organization).values([
    { id: G1, name: "Main Group", slug: "main-group", createdAt: new Date() },
    { id: G2, name: "Second Group", slug: "second-group", createdAt: new Date() },
  ]);
  await db.insert(member).values([
    { id: "m1", organizationId: G1, userId: U1, role: "owner", createdAt: new Date() },
    { id: "m2", organizationId: G1, userId: U2, role: "member", createdAt: new Date() },
    { id: "m3", organizationId: G2, userId: U1, role: "member", createdAt: new Date() },
  ]);
});

// ---------------------------------------------------------------------------
// getGroupsDataHandler
// ---------------------------------------------------------------------------

describe("getGroupsDataHandler", () => {
  it("returns all groups the user belongs to", async () => {
    const result = await getGroupsDataHandler(db, { id: U1, activeOrganizationId: G1 });
    expect(result.userGroups).toHaveLength(2);
    expect(result.userGroups.map((g: { id: string }) => g.id)).toEqual(
      expect.arrayContaining([G1, G2]),
    );
  });

  it("returns empty groups for user with no memberships", async () => {
    const result = await getGroupsDataHandler(db, { id: U3, activeOrganizationId: null });
    expect(result.userGroups).toHaveLength(0);
    expect(result.currentGroup).toBeNull();
    expect(result.currentGroupMembers).toHaveLength(0);
    expect(result.isOwner).toBe(false);
  });

  it("sets currentGroup when activeOrganizationId matches a membership", async () => {
    const result = await getGroupsDataHandler(db, { id: U1, activeOrganizationId: G1 });
    expect(result.currentGroup).not.toBeNull();
    expect(result.currentGroup?.id).toBe(G1);
  });

  it("returns null currentGroup when activeOrganizationId is null", async () => {
    const result = await getGroupsDataHandler(db, { id: U1, activeOrganizationId: null });
    expect(result.currentGroup).toBeNull();
    expect(result.currentGroupMembers).toHaveLength(0);
  });

  it("returns null currentGroup when activeOrganizationId is not user's group", async () => {
    const result = await getGroupsDataHandler(db, { id: U2, activeOrganizationId: G2 });
    expect(result.currentGroup).toBeNull();
  });

  it("returns members for the active group", async () => {
    const result = await getGroupsDataHandler(db, { id: U1, activeOrganizationId: G1 });
    expect(result.currentGroupMembers).toHaveLength(2);
    const ids = result.currentGroupMembers.map((m: { userId: string }) => m.userId);
    expect(ids).toEqual(expect.arrayContaining([U1, U2]));
  });

  it("marks user as owner when they have owner role in active group", async () => {
    const result = await getGroupsDataHandler(db, { id: U1, activeOrganizationId: G1 });
    expect(result.isOwner).toBe(true);
  });

  it("marks user as not owner when they have member role", async () => {
    const result = await getGroupsDataHandler(db, { id: U2, activeOrganizationId: G1 });
    expect(result.isOwner).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// addMemberByEmailHandler
// ---------------------------------------------------------------------------

describe("addMemberByEmailHandler", () => {
  it("adds a new member to the group", async () => {
    await addMemberByEmailHandler(db, U1, G1, "charlie@test.com");

    const members = await db.select().from(member).where(eq(member.organizationId, G1));
    expect(members).toHaveLength(3);
    expect(members.map((m) => m.userId)).toContain(U3);
  });

  it("new member gets role 'member'", async () => {
    await addMemberByEmailHandler(db, U1, G1, "charlie@test.com");

    const [row] = await db.select({ role: member.role }).from(member).where(eq(member.userId, U3));
    expect(row.role).toBe("member");
  });

  it("throws when email not found", async () => {
    await expect(addMemberByEmailHandler(db, U1, G1, "nobody@test.com")).rejects.toThrow(
      "Nie znaleziono użytkownika o podanym adresie email",
    );
  });

  it("throws when user is already a member", async () => {
    await expect(addMemberByEmailHandler(db, U1, G1, "bob@test.com")).rejects.toThrow(
      "Użytkownik jest już członkiem tej grupy",
    );
  });

  it("throws when actor is not an owner", async () => {
    await expect(addMemberByEmailHandler(db, U2, G1, "charlie@test.com")).rejects.toThrow(
      "Brak uprawnień",
    );
  });

  it("throws when actor is not a member of the group at all", async () => {
    await expect(addMemberByEmailHandler(db, U3, G1, "charlie@test.com")).rejects.toThrow(
      "Brak uprawnień",
    );
  });
});
