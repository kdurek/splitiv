import { z } from 'zod';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';

export const expenseNoteRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ expenseId: z.string().cuid(), content: z.string() }))
    .mutation(({ input, ctx }) => {
      return ctx.db.expenseNote.create({
        data: {
          expenseId: input.expenseId,
          content: input.content,
          createdById: ctx.user.id,
        },
      });
    }),
});
