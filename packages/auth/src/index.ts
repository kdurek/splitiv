import prisma from "@splitiv/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

export const auth = betterAuth({
  appName: "Splitiv",
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.CORS_ORIGIN || ""],
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google:
      process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
        ? {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            mapProfileToUser: (profile) => ({
              name: profile.name,
              email: profile.email,
              emailVerified: profile.email_verified,
              image: profile.picture,
              firstName: profile.given_name,
              lastName: profile.family_name,
            }),
          }
        : undefined,
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
