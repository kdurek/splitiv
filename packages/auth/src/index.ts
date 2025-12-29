import prisma from "@splitiv/db";
import { env } from "@splitiv/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import type { GoogleProfile } from "better-auth/social-providers";

export const auth = betterAuth({
  appName: "Splitiv",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      mapProfileToUser: (profile: GoogleProfile) => ({
        name: profile.name,
        email: profile.email,
        emailVerified: profile.email_verified,
        image: profile.picture,
        firstName: profile.given_name,
        lastName: profile.family_name,
      }),
    },
  },
  user: {
    additionalFields: {
      firstName: {
        type: "string",
        input: false,
      },
      lastName: {
        type: "string",
        input: false,
      },
      activeGroupId: {
        type: "string",
        input: false,
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
});

export type Session = typeof auth.$Infer.Session.session;
export type User = typeof auth.$Infer.Session.user;
