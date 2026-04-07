import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { db } from "@repo/db";
import { group, user, userGroup } from "@repo/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { eq, notInArray } from "drizzle-orm";

export const $getGroupsData = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const currentUser = context.user;

    const userGroups = await db
      .select({ id: group.id, name: group.name, adminId: group.adminId })
      .from(userGroup)
      .innerJoin(group, eq(group.id, userGroup.groupId))
      .where(eq(userGroup.userId, currentUser.id));

    const currentGroup = currentUser.activeGroupId
      ? (userGroups.find((g) => g.id === currentUser.activeGroupId) ?? null)
      : null;

    const currentGroupMembers = currentGroup
      ? await db
          .select({ userId: user.id, name: user.name })
          .from(userGroup)
          .innerJoin(user, eq(user.id, userGroup.userId))
          .where(eq(userGroup.groupId, currentGroup.id))
      : [];

    const memberIds = currentGroupMembers.map((m) => m.userId);
    const usersNotInGroup =
      currentGroup && memberIds.length > 0
        ? await db
            .select({ id: user.id, name: user.name })
            .from(user)
            .where(notInArray(user.id, memberIds))
        : [];

    return { currentUser, currentGroup, currentGroupMembers, usersNotInGroup, userGroups };
  });

export const $setActiveGroup = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: { groupId: string }) => input)
  .handler(async ({ context, data }) => {
    await db.update(user).set({ activeGroupId: data.groupId }).where(eq(user.id, context.user.id));
  });

export const $addUserToGroup = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator((input: { userId: string; groupId: string }) => input)
  .handler(async ({ context, data }) => {
    const [targetGroup] = await db.select().from(group).where(eq(group.id, data.groupId));

    if (!targetGroup || targetGroup.adminId !== context.user.id) {
      throw new Error("Brak uprawnień");
    }

    await db.insert(userGroup).values({ userId: data.userId, groupId: data.groupId });
  });
