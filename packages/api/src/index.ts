import { ORPCError, os } from "@orpc/server";
import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(({ context, next }) => {
  if (!(context.session && context.user)) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      session: context.session,
      user: context.user,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);
