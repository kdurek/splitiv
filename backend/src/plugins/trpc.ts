import { fastifyTRPCPlugin } from "@trpc/server/adapters/fastify";
import fp from "fastify-plugin";

import { appRouter } from "../router";
import { createContext } from "../router/context";

import type { FastifyPluginAsync } from "fastify";

const trpcPlugin: FastifyPluginAsync = fp(async (fastify) => {
  fastify.register(fastifyTRPCPlugin, {
    prefix: "/api/v1/trpc",
    useWSS: true,
    trpcOptions: { router: appRouter, createContext },
  });
});

export default trpcPlugin;
