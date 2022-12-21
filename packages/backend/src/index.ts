import setupServer from "./server";

import type { FastifyInstance } from "fastify";

const envToLogger = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: true,
  test: false,
};

const fastify: FastifyInstance = setupServer({
  logger: envToLogger[process.env.NODE_ENV] ?? true,
});

const start = async () => {
  try {
    await fastify.listen({
      host: process.env.SERVER_HOST ?? "127.0.0.1",
      port: Number(process.env.SERVER_PORT) ?? 5174,
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
