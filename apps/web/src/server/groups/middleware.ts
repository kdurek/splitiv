import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { db } from "@repo/db";
import { group, userGroup } from "@repo/db/schema";
import { createMiddleware } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";

export const activeGroupMiddleware = createMiddleware()
  .middleware([authMiddleware])
  .server(async ({ context, next }) => {
    const user = context?.user;
    const activeGroupId = user?.activeGroupId;

    if (!user || !activeGroupId) {
      setResponseStatus(400);
      throw new Error("Brak aktywnej grupy");
    }

    const [membership] = await db
      .select({ group: { id: group.id, name: group.name, adminId: group.adminId } })
      .from(userGroup)
      .innerJoin(group, eq(group.id, userGroup.groupId))
      .where(and(eq(userGroup.userId, user.id), eq(userGroup.groupId, activeGroupId)))
      .limit(1);
    const activeGroup = membership?.group ?? null;

    if (!activeGroup) {
      setResponseStatus(403);
      throw new Error("Brak uprawnień");
    }

    return next({ context: { user, activeGroup, activeGroupId } });
  });

export const activeGroupAdminMiddleware = createMiddleware()
  .middleware([authMiddleware, activeGroupMiddleware])
  .server(async ({ context, next }) => {
    if (!context || context.activeGroup.adminId !== context.user.id) {
      setResponseStatus(403);
      throw new Error("Brak uprawnień");
    }

    return next();
  });
