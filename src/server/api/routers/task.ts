import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../trpc";

export const taskRouter = createTRPCRouter({
  getTasksByGroup: protectedProcedure
    .input(z.object({ groupId: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.task.findMany({
        where: {
          groupId: input.groupId,
        },
        orderBy: { createdAt: "desc" },
      });
    }),

  createTask: protectedProcedure
    .input(
      z.object({
        groupId: z.string(),
        name: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.task.create({
        data: {
          name: input.name,
          groupId: input.groupId,
        },
      });
    }),

  deleteTask: protectedProcedure
    .input(z.object({ groupId: z.string(), taskId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.task.delete({
        where: {
          id: input.taskId,
        },
      });
    }),
});
