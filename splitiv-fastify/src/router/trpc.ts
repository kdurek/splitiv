import { TRPCError, initTRPC } from "@trpc/server";
import axios from "axios";
import { createVerifier } from "fast-jwt";
import buildGetJwks from "get-jwks";
import superjson from "superjson";

import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

function extractToken(authString: string) {
  const parts = authString.split(" ");
  return parts[1];
}

const isAuthed = t.middleware(async ({ next, ctx }) => {
  if (!ctx.req.headers.authorization)
    throw new TRPCError({ code: "UNAUTHORIZED", message: "NO TOKEN" });

  const token = extractToken(ctx.req.headers.authorization);

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

  const user = await ctx.prisma.user.findUnique({
    where: { sub: payload.sub },
  });

  if (!user) {
    const { data } = await axios.get(`${process.env.AUTH0_DOMAIN}userinfo`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const createdUser = await ctx.prisma.user.create({
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

    return next({
      ctx: {
        user: createdUser,
      },
    });
  }

  return next({
    ctx: {
      user,
    },
  });
});

export const { router } = t;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthed);
