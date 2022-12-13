import { protectedProcedure, publicProcedure, router } from "../trpc";

export const usersRouter = router({
  getCurrentUser: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findUnique({
      where: { sub: ctx.user.sub },
    });
  }),
  getUsers: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),
});
