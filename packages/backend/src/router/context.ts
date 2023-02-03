import { getUserFromHeader } from "../auth";
import prisma from "../prisma";

import type { inferAsyncReturnType } from "@trpc/server";
import type { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";

export async function createContext({ req, res }: CreateFastifyContextOptions) {
  const user = await getUserFromHeader(req.headers);

  return { req, res, user, prisma };
}

export type Context = inferAsyncReturnType<typeof createContext>;
