import { protectedProcedure, publicProcedure } from "@splitiv/api";
import { auth } from "@splitiv/auth";
import prisma from "@splitiv/db";

export const authRouter = {
  getCurrentUser: publicProcedure.handler(async ({ context }) => {
    const session = await auth.api.getSession({
      headers: context.headers,
    });

    return session?.user || null;
  }),

  listNotInCurrentGroup: protectedProcedure.handler(async ({ context }) => {
    const users = await prisma.user.findMany({
      where: {
        groups: {
          none: {
            groupId: context.user.activeGroupId,
          },
        },
      },
    });
    return users;
  }),
};
