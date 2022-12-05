import {
  addUserToGroup,
  createExpense,
  createGroup,
  deleteExpense,
  deleteGroupById,
  deleteUserFromGroup,
  getExpensesByGroup,
  getGroupById,
  getGroupsByMe,
} from "../controllers/groups";

import type { FastifyInstance } from "fastify";

async function groupRoutes(fastify: FastifyInstance) {
  fastify.post("/", createGroup);
  fastify.get("/", getGroupsByMe);
  fastify.get("/:groupId", getGroupById);
  fastify.delete("/:groupId", deleteGroupById);
  fastify.post("/:groupId/users", addUserToGroup);
  fastify.delete("/:groupId/users", deleteUserFromGroup);
  fastify.get("/:groupId/expenses", getExpensesByGroup);
  fastify.post("/:groupId/expenses", createExpense);
  fastify.delete("/:groupId/expenses/:expenseId", deleteExpense);
}

export default groupRoutes;
