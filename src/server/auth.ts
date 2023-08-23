/* eslint-disable no-param-reassign */
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { env } from 'env.mjs';
import { getServerSession, type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

import { prisma } from './db';

export const authOptions: NextAuthOptions = {
  callbacks: {
    async signIn({ user, profile }) {
      if (!user.image && profile?.picture) {
        await prisma.user.update({
          where: { id: user.id },
          data: { image: profile.picture },
        });
      }
      return true;
    },
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.gender = user.gender;
      }
      if (user.activeGroupId) {
        session.activeGroupId = user.activeGroupId;
      }
      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
};

export function getServerAuthSession() {
  return getServerSession(authOptions);
}
