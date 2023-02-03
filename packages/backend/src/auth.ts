import axios from "axios";
import { createVerifier } from "fast-jwt";
import buildGetJwks from "get-jwks";

import prisma from "./prisma";

import type { FastifyRequest } from "fastify";

export async function createUser(token: string | undefined) {
  const { data } = await axios.get(`${process.env.AUTH0_DOMAIN}userinfo`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const createdUser = await prisma.user.create({
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

  return createdUser;
}

export async function verifyTokenAndGetUser(token: string | undefined) {
  const getJwks = buildGetJwks();

  const verifyWithPromise = createVerifier({
    // @ts-ignore
    async key(parsedToken) {
      return getJwks.getPublicKey({
        kid: parsedToken.kid,
        alg: parsedToken.alg,
        domain: process.env.AUTH0_DOMAIN,
      });
    },
  });

  const payload: { sub: string } = await verifyWithPromise(token as string);

  const user = await prisma.user.findUnique({
    where: { sub: payload.sub },
  });

  if (!user) {
    return createUser(token);
  }

  return user;
}

export async function getUserFromHeader(headers: FastifyRequest["headers"]) {
  const authHeader = headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    const user = await verifyTokenAndGetUser(token);
    return user;
  }
  return null;
}
