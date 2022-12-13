import { PrismaClient } from "@prisma/client";

import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

export function createContext({ req, res }: CreateFastifyContextOptions) {
  const prisma = new PrismaClient();

  return { req, res, prisma };
}

export type Context = inferAsyncReturnType<typeof createContext>;
