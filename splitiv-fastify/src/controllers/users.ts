import type { FastifyRequest } from "fastify";

export async function getUsers(request: FastifyRequest) {
  return request.server.prisma.user.findMany();
}

export async function getCurrentUser(request: FastifyRequest) {
  const { sub } = request.user;

  return request.server.prisma.user.findUnique({
    where: { sub },
  });
}
