import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { Gender } from '@prisma/client';
import { type DefaultSession, type DefaultUser, getServerSession, type NextAuthOptions } from 'next-auth';
import GoogleProvider, { type GoogleProfile } from 'next-auth/providers/google';

import { env } from '@/env';
import { db } from '@/server/db';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */

declare module 'next-auth' {
  interface Session extends DefaultSession {
    activeGroupId: string;
    user: {
      id: string;
      gender?: Gender | null;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    gender?: Gender | null;
    activeGroupId: string | null;
  }

  interface Profile extends GoogleProfile {
    id: string;
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    async signIn({ user, profile }) {
      if (!user.image && profile?.picture) {
        await db.user.update({
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
  adapter: PrismaAdapter(db),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = () => getServerSession(authOptions);
