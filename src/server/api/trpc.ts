import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';

import { getServerAuthSession } from '../auth';
import { prisma } from '../db';

export const createTRPCContext = async () => {
  return {
    prisma,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

const enforceUserIsAuthed = t.middleware(async ({ next }) => {
  const session = await getServerAuthSession();

  if (!session?.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      session: { ...session, user: session.user },
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed);
