import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),

  getAllNotInGroup: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: {
        groups: {
          none: {
            groupId: ctx.session.activeGroupId,
          },
        },
      },
    });
  }),

  changeActiveGroup: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.user.update({
        where: { id: ctx.session.user.id },
        data: {
          activeGroupId: input.groupId,
        },
      });
    }),
});
