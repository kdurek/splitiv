import fastifyEnv from "@fastify/env";
import fp from "fastify-plugin";

import type { FastifyPluginAsync } from "fastify";

interface EnvVariables {
  NODE_ENV: "development" | "production" | "test";
  SERVER_HOST: string;
  SERVER_PORT: number;
  AUTH0_DOMAIN: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvVariables {}
  }
}

declare module "fastify" {
  interface FastifyInstance {
    config: EnvVariables;
  }
}

const schema = {
  type: "object",
  required: ["NODE_ENV", "SERVER_HOST", "SERVER_PORT", "AUTH0_DOMAIN"],
  properties: {
    NODE_ENV: {
      type: "string",
    },
    SERVER_HOST: {
      type: "string",
    },
    SERVER_PORT: {
      type: "number",
    },
    AUTH0_DOMAIN: {
      type: "string",
    },
  },
};

const options = {
  confKey: "config",
  schema,
  dotenv: true,
};

const envConfig: FastifyPluginAsync = fp(async (fastify) => {
  fastify.register(fastifyEnv, options).ready((err) => {
    if (err) fastify.log.error(err);
  });
});

export default envConfig;
