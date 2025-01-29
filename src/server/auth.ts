import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';

import { env } from '@/env';
import { db } from '@/server/db';

export const auth = betterAuth({
  appName: 'Splitiv',
  trustedOrigins: ['*'],
  database: prismaAdapter(db, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      mapProfileToUser: (profile) => {
        return {
          name: profile.name,
          email: profile.email,
          emailVerified: profile.email_verified,
          image: profile.picture,
          firstName: profile.given_name,
          lastName: profile.family_name,
        };
      },
    },
  },
  user: {
    additionalFields: {
      firstName: {
        type: 'string',
      },
      lastName: {
        type: 'string',
      },
      activeGroupId: {
        type: 'string',
        input: false,
      },
    },
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
});
