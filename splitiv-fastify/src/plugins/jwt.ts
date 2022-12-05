import fastifyJwt from "@fastify/jwt";
import axios from "axios";
import fp from "fastify-plugin";
import buildGetJwks from "get-jwks";

import type {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from "fastify";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      email: string;
      sub: string;
      givenName: string;
      familyName: string;
      nickname: string;
      name: string;
      picture: string;
    };
  }
}

const jwtCheck: FastifyPluginAsync = fp(async (fastify: FastifyInstance) => {
  const getJwks = buildGetJwks();

  fastify.register(fastifyJwt, {
    decode: { complete: true },
    secret: (_request: FastifyRequest, token) => {
      const {
        header: { kid, alg },
      } = token;
      return getJwks.getPublicKey({
        domain: process.env.AUTH0_DOMAIN,
        alg,
        kid,
      });
    },
  });

  fastify.addHook(
    "onRequest",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
        const user = await request.server.prisma.user.findUnique({
          where: { sub: request.user.sub },
        });

        if (!user) {
          const { data } = await axios.get(
            `${process.env.AUTH0_DOMAIN}userinfo`,
            {
              headers: { Authorization: request.headers.authorization },
            }
          );

          request.user = await request.server.prisma.user.create({
            data: {
              email: data.email,
              sub: data.sub,
              givenName: data.given_name,
              familyName: data.family_name,
              nickname: data.nickname,
              name: data.name,
              picture: data.picture,
            },
          });
        }

        if (user) {
          request.user = user;
        }
      } catch (err) {
        reply.send(err);
      }
    }
  );
});

export default jwtCheck;
