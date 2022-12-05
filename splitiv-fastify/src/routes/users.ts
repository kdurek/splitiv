import { getCurrentUser, getUsers } from "../controllers/users";

import type { FastifyInstance } from "fastify";

async function userRoutes(fastify: FastifyInstance) {
  fastify.get("/", getUsers);
  fastify.get("/me", getCurrentUser);
}

export default userRoutes;
