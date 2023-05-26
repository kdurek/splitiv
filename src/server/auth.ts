/* eslint-disable no-param-reassign */
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import {
  type DefaultSession,
  type NextAuthOptions,
  getServerSession,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { env } from "../env/server.mjs";

import { prisma } from "./db";

import type { GoogleProfile } from "next-auth/providers/google";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface Profile extends GoogleProfile {
    id: string;
  }
}

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
