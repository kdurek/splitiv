import { freshAuthMiddleware } from "@repo/auth/tanstack/middleware";
import { db } from "@repo/db";
import { group, user, userGroup } from "@repo/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, notInArray } from "drizzle-orm";
import { z } from "zod";

export async function _getGroupForUser(userId: string, groupId: string) {
  const [membership] = await db
    .select({
      group: { id: group.id, name: group.name, adminId: group.adminId },
    })
    .from(userGroup)
    .innerJoin(group, eq(group.id, userGroup.groupId))
    .where(and(eq(userGroup.userId, userId), eq(userGroup.groupId, groupId)))
    .limit(1);

  return membership?.group ?? null;
}

export const $getGroupsData = createServerFn({ method: "GET" })
  .middleware([freshAuthMiddleware])
  .handler(async ({ context }) => {
    const currentUser = context.user;

    const userGroups = await db
      .select({ id: group.id, name: group.name, adminId: group.adminId })
      .from(userGroup)
      .innerJoin(group, eq(group.id, userGroup.groupId))
      .where(eq(userGroup.userId, currentUser.id));

    const currentGroup = currentUser.activeGroupId
      ? (userGroups.find((candidate) => candidate.id === currentUser.activeGroupId) ?? null)
      : null;

    const currentGroupMembers = currentGroup
      ? await db
          .select({ userId: user.id, name: user.name })
          .from(userGroup)
          .innerJoin(user, eq(user.id, userGroup.userId))
          .where(eq(userGroup.groupId, currentGroup.id))
      : [];

    const memberIds = currentGroupMembers.map((member) => member.userId);
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
  .middleware([freshAuthMiddleware])
  .inputValidator(z.object({ groupId: z.string().min(1) }))
  .handler(async ({ context, data }) => {
    const targetGroup = await _getGroupForUser(context.user.id, data.groupId);

    if (!targetGroup) {
      throw new Error("Brak uprawnień");
    }

    await db.update(user).set({ activeGroupId: data.groupId }).where(eq(user.id, context.user.id));
  });

export const $addUserToActiveGroup = createServerFn({ method: "POST" })
  .middleware([freshAuthMiddleware])
  .inputValidator(z.object({ userId: z.string().min(1), groupId: z.string().min(1) }))
  .handler(async ({ context, data }) => {
    const targetGroup = await _getGroupForUser(context.user.id, data.groupId);

    if (!targetGroup || targetGroup.adminId !== context.user.id) {
      throw new Error("Brak uprawnień");
    }

    await db.insert(userGroup).values({ userId: data.userId, groupId: data.groupId });
  });
