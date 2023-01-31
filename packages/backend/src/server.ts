import fastifyCors from "@fastify/cors";
import fastifyHelmet from "@fastify/helmet";
import fastifyWebsocket from "@fastify/websocket";
import Fastify from "fastify";

import { LOGGER_ENV } from "./config";
import envConfig from "./plugins/env";
import trpcPlugin from "./plugins/trpc";

export function setupServer() {
  const host = process.env.SERVER_HOST ?? "127.0.0.1";
  const port = Number(process.env.SERVER_PORT) ?? 37534;
  const logger = LOGGER_ENV[process.env.NODE_ENV] ?? true;

  const server = Fastify({ logger });

  server.register(envConfig);
  server.register(fastifyHelmet, { global: true });
  server.register(fastifyCors);
  server.register(fastifyWebsocket);
  server.register(trpcPlugin);

  const stop = () => server.close();
  const start = async () => {
    try {
      await server.listen({
        host,
        port,
      });
    } catch (err) {
      server.log.error(err);
      process.exit(1);
    }
  };

  return { server, start, stop };
}
