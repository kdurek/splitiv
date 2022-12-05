import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import Fastify from "fastify";

import envConfig from "./plugins/env";
import jwtCheck from "./plugins/jwt";
import prismaPlugin from "./plugins/prisma";
import groupRoutes from "./routes/groups";
import userRoutes from "./routes/users";

const setupServer = (options = {}) => {
  const fastify = Fastify(options);

  fastify.register(envConfig);
  fastify.register(fastifyHelmet, { global: true });
  fastify.register(fastifyCors);
  fastify.register(jwtCheck);
  fastify.register(prismaPlugin);
  fastify.register(groupRoutes, { prefix: "/api/v1/groups" });
  fastify.register(userRoutes, { prefix: "/api/v1/users" });

  return fastify;
};

export default setupServer;
