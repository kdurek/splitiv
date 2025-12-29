import type { auth } from "@splitiv/auth";
import { env } from "@splitiv/env/web";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: env.VITE_SERVER_URL,
  plugins: [inferAdditionalFields<typeof auth>()],
});
