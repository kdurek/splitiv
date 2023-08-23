import type { Gender } from '@prisma/client';
import type { DefaultSession, DefaultUser } from 'next-auth';
import type { GoogleProfile } from 'next-auth/providers/google';

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
