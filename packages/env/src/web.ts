import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_SERVER_URL: z.url(),
    VITE_BASE_URL: z.url(),
    VITE_WEB_PUSH_PUBLIC_KEY: z.string().min(1),
  },
  runtimeEnv: (import.meta as unknown as { env: Record<string, string> }).env,
  emptyStringAsUndefined: true,
});
