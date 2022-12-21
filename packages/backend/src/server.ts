import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyWebsocket from "@fastify/websocket";
import Fastify from "fastify";

import envConfig from "./plugins/env";
import trpcPlugin from "./plugins/trpc";

const setupServer = (options = {}) => {
  const fastify = Fastify(options);

  fastify.register(envConfig);
  fastify.register(fastifyHelmet, { global: true });
  fastify.register(fastifyCors);
  fastify.register(fastifyWebsocket);
  fastify.register(trpcPlugin);

  return fastify;
};

export default setupServer;
