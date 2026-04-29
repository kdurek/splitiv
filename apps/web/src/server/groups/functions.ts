import { auth } from "@repo/auth/auth";
import { freshAuthMiddleware } from "@repo/auth/tanstack/middleware";
import { db } from "@repo/db";
import { member } from "@repo/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { ulid } from "ulid";
import { z } from "zod";

import { addMemberByEmailHandler, getGroupsDataHandler } from "./handlers";
import { activeGroupAdminMiddleware } from "./middleware";

export const $createGroup = createServerFn({ method: "POST" })
  .middleware([freshAuthMiddleware])
  .inputValidator(z.object({ name: z.string().min(1) }))
  .handler(async ({ data }) => {
    const slug = `${data.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")}-${ulid().slice(-6).toLowerCase()}`;

    const response = await auth.api.createOrganization({
      body: { name: data.name, slug },
      headers: getRequest().headers,
      returnHeaders: true,
    });

    const cookies = (response as any).headers?.getSetCookie?.();
    if (cookies?.length) {
      setResponseHeader("Set-Cookie", cookies);
    }

    return { id: response.response.id };
  });

export const $getGroupsData = createServerFn({ method: "GET" })
  .middleware([freshAuthMiddleware])
  .handler(async ({ context }) => {
    const data = await getGroupsDataHandler(db, {
      id: context.user.id,
      activeOrganizationId: context.session.activeOrganizationId ?? null,
    });
    return { ...data, currentUser: context.user };
  });

export const $setActiveGroup = createServerFn({ method: "POST" })
  .middleware([freshAuthMiddleware])
  .inputValidator(z.object({ groupId: z.string().min(1) }))
  .handler(async ({ context, data }) => {
    const [membership] = await db
      .select({ id: member.id })
      .from(member)
      .where(and(eq(member.userId, context.user.id), eq(member.organizationId, data.groupId)))
      .limit(1);

    if (!membership) {
      throw new Error("Brak uprawnień");
    }

    const response = await auth.api.setActiveOrganization({
      body: { organizationId: data.groupId },
      headers: getRequest().headers,
      returnHeaders: true,
    });

    // Forward Set-Cookie so the session update reaches the client
    const cookies = (response as any).headers?.getSetCookie?.();
    if (cookies?.length) {
      setResponseHeader("Set-Cookie", cookies);
    }
  });

export const $addMemberByEmail = createServerFn({ method: "POST" })
  .middleware([activeGroupAdminMiddleware])
  .inputValidator(z.object({ email: z.email() }))
  .handler(async ({ context, data }) => {
    await addMemberByEmailHandler(db, context.user.id, context.activeGroupId, data.email);
  });
