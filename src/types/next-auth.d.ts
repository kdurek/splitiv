import type { DefaultSession, DefaultUser } from "next-auth";
import type { GoogleProfile } from "next-auth/providers/google";

declare module "next-auth" {
  interface Session extends DefaultSession {
    activeGroupId: string;
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    activeGroupId: string;
  }

  interface Profile extends GoogleProfile {
    id: string;
  }
}
