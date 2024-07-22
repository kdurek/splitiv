import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import type { Gender } from '@prisma/client';
import { Google } from 'arctic';
import { Lucia, type Session, type User } from 'lucia';
import { cookies } from 'next/headers';
import { cache } from 'react';

import { env } from '@/env';
import { db } from '@/server/db';

declare module 'lucia' {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes {
  id: string;
  name: string;
  email: string;
  image: string;
  gender: Gender;
  activeGroupId: string;
}

export const google = new Google(
  env.GOOGLE_CLIENT_ID,
  env.GOOGLE_CLIENT_SECRET,
  env.BASE_URL + '/api/auth/callback/google',
);

const adapter = new PrismaAdapter(db.session, db.user);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      name: attributes.name,
      email: attributes.email,
      image: attributes.image,
      gender: attributes.gender,
      activeGroupId: attributes.activeGroupId,
    };
  },
});

export const validateRequest = cache(
  async (): Promise<{ user: User; session: Session } | { user: null; session: null }> => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const result = await lucia.validateSession(sessionId);
    // next.js throws when you attempt to set cookie when rendering page
    try {
      if (result.session?.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
      }
    } catch {}
    return result;
  },
);
