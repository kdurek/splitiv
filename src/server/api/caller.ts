import { getServerAuthSession } from "../auth";
import { prisma } from "../db";

import { appRouter } from "./root";

export async function createTrpcCaller() {
  const session = await getServerAuthSession();
  const caller = appRouter.createCaller({
    prisma,
    session,
  });

  return caller;
}
