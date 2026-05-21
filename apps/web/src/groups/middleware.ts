import { auth } from "@repo/auth/auth";
import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { db } from "@repo/db";
import { member, organization } from "@repo/db/schema";
import { createMiddleware } from "@tanstack/react-start";
import { getRequest, setResponseStatus } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";

export const activeGroupMiddleware = createMiddleware()
  .middleware([authMiddleware])
  .server(async ({ context, next }) => {
    const { user, session } = context;
    const activeGroupId = session.activeOrganizationId;

    if (!activeGroupId) {
      setResponseStatus(400);
      throw new Error("Brak aktywnej grupy");
    }

    const [membership] = await db
      .select({ group: { id: organization.id, name: organization.name } })
      .from(member)
      .innerJoin(organization, eq(organization.id, member.organizationId))
      .where(and(eq(member.userId, user.id), eq(member.organizationId, activeGroupId)))
      .limit(1);
    const activeGroup = membership?.group ?? null;

    if (!activeGroup) {
      setResponseStatus(403);
      throw new Error("Brak uprawnień");
    }

    return next({ context: { user, session, activeGroup, activeGroupId } });
  });

export const activeGroupAdminMiddleware = createMiddleware()
  .middleware([authMiddleware, activeGroupMiddleware])
  .server(async ({ context, next }) => {
    const { success } = await auth.api.hasPermission({
      body: {
        permissions: { organization: ["update"] },
        organizationId: context.activeGroupId,
      },
      headers: getRequest().headers,
    });

    if (!success) {
      setResponseStatus(403);
      throw new Error("Brak uprawnień");
    }

    return next();
  });
