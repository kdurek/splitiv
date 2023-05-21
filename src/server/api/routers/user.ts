import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),

  getAllNotInGroup: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.user.findMany({
        where: {
          groups: {
            none: {
              groupId: input.groupId,
            },
          },
        },
      });
    }),
});
