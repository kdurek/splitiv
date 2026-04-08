import { authMiddleware } from "@repo/auth/tanstack/middleware";
import { createMiddleware } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";

import { _getGroupForUser } from "./functions";

export const activeGroupMiddleware = createMiddleware()
  .middleware([authMiddleware])
  .server(async ({ context, next }) => {
    const user = context?.user;
    const activeGroupId = user?.activeGroupId;

    if (!user || !activeGroupId) {
      setResponseStatus(400);
      throw new Error("Brak aktywnej grupy");
    }

    const activeGroup = await _getGroupForUser(user.id, activeGroupId);

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
