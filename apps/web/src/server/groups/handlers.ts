// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = any;
type UserCtx = { id: string; activeOrganizationId: string | null };

import { member, organization, user } from "@repo/db/schema";
import { and, eq } from "drizzle-orm";
import { ulid } from "ulid";

type Group = { id: string; name: string };
type GroupMember = { userId: string; name: string; image: string | null; role: string };

export async function getGroupsDataHandler(
  db: Db,
  currentUser: UserCtx,
): Promise<{
  currentGroup: Group | null;
  currentGroupMembers: GroupMember[];
  userGroups: Group[];
  isOwner: boolean;
}> {
  const activeGroupId = currentUser.activeOrganizationId;

  const userGroups = await db
    .select({ id: organization.id, name: organization.name })
    .from(member)
    .innerJoin(organization, eq(organization.id, member.organizationId))
    .where(eq(member.userId, currentUser.id));

  const currentGroup = activeGroupId
    ? (userGroups.find((g: { id: string }) => g.id === activeGroupId) ?? null)
    : null;

  const currentGroupMembers = currentGroup
    ? await db
        .select({ userId: user.id, name: user.name, image: user.image, role: member.role })
        .from(member)
        .innerJoin(user, eq(user.id, member.userId))
        .where(eq(member.organizationId, currentGroup.id))
    : [];

  const isOwner = currentGroup
    ? currentGroupMembers.some(
        (m: { userId: string; role: string }) => m.userId === currentUser.id && m.role === "owner",
      )
    : false;

  return { currentGroup, currentGroupMembers, userGroups, isOwner };
}

export async function addMemberByEmailHandler(
  db: Db,
  actorId: string,
  activeGroupId: string,
  email: string,
) {
  const [actorMember] = await db
    .select({ role: member.role })
    .from(member)
    .where(and(eq(member.userId, actorId), eq(member.organizationId, activeGroupId)))
    .limit(1);

  if (!actorMember || actorMember.role !== "owner") {
    throw new Error("Brak uprawnień");
  }

  const [targetUser] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email))
    .limit(1);

  if (!targetUser) {
    throw new Error("Nie znaleziono użytkownika o podanym adresie email");
  }

  const [existing] = await db
    .select({ id: member.id })
    .from(member)
    .where(and(eq(member.userId, targetUser.id), eq(member.organizationId, activeGroupId)))
    .limit(1);

  if (existing) {
    throw new Error("Użytkownik jest już członkiem tej grupy");
  }

  await db.insert(member).values({
    id: ulid(),
    organizationId: activeGroupId,
    userId: targetUser.id,
    role: "member",
    createdAt: new Date(),
  });
}
