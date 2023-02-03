import { z } from "zod";

import { protectedProcedure, publicProcedure, router } from "../trpc";

export const userRouter = router({
  getCurrentUser: protectedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  getUser: publicProcedure
    .input(z.object({ sub: z.string().optional() }))
    .query(({ input, ctx }) => {
      if (!input.sub) return null;

      return ctx.prisma.user.findUnique({
        where: { sub: input.sub },
      });
    }),

  getUsers: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),
});
