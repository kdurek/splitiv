import { cookies } from 'next/headers';

import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { lucia } from '@/server/auth';

export const authRouter = createTRPCRouter({
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    await lucia.invalidateSession(ctx.session.id);

    const sessionCookie = lucia.createBlankSessionCookie();
    cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
  }),
});
