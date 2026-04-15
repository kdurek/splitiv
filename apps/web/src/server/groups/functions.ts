import { auth } from "@repo/auth/auth";
import { freshAuthMiddleware } from "@repo/auth/tanstack/middleware";
import { db } from "@repo/db";
import { member, organization, user } from "@repo/db/schema";
import { createServerFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";
import { and, eq } from "drizzle-orm";
import { ulid } from "ulid";
import { z } from "zod";

import { activeGroupAdminMiddleware } from "./middleware";

export const $getGroupsData = createServerFn({ method: "GET" })
  .middleware([freshAuthMiddleware])
  .handler(async ({ context }) => {
    const currentUser = context.user;
    const activeGroupId = context.session.activeOrganizationId;

    const userGroups = await db
      .select({ id: organization.id, name: organization.name })
      .from(member)
      .innerJoin(organization, eq(organization.id, member.organizationId))
      .where(eq(member.userId, currentUser.id));

    const currentGroup = activeGroupId
      ? (userGroups.find((g) => g.id === activeGroupId) ?? null)
      : null;

    const currentGroupMembers = currentGroup
      ? await db
          .select({ userId: user.id, name: user.name, image: user.image, role: member.role })
          .from(member)
          .innerJoin(user, eq(user.id, member.userId))
          .where(eq(member.organizationId, currentGroup.id))
      : [];

    const isOwner = currentGroup
      ? currentGroupMembers.some((m) => m.userId === currentUser.id && m.role === "owner")
      : false;

    return { currentUser, currentGroup, currentGroupMembers, userGroups, isOwner };
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
    const { activeGroupId } = context;

    const [targetUser] = await db
      .select({ id: user.id })
      .from(user)
      .where(eq(user.email, data.email))
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
  });
