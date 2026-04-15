import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import { getRequest, setResponseHeader } from "@tanstack/react-start/server";

import { auth } from "../auth";

/**
 * This server function is meant to be called via authQueryOptions() in queries.ts,
 * which is used in the _auth layout route to protect all child routes under it (e.g. _auth/app/*)
 *
 * For securing server functions or API routes,
 * consider using authMiddleware from middleware.ts instead.
 */
export const $getUser = createServerFn({ method: "GET" }).handler(async () => {
  const result = await _getSession();
  if (!result) return null;
  return { ...result.user, activeOrganizationId: result.session.activeOrganizationId ?? null };
});

interface GetSessionQuery {
  disableCookieCache?: boolean | undefined;
  disableRefresh?: boolean | undefined;
}

/**
 * Server-only util, meant to be used by the $getUser server function and auth middleware so logic can be shared with optional query params.
 *
 * For server app logic, consider using authMiddleware instead.
 */
export const _getSession = createServerOnlyFn(async (query?: GetSessionQuery) => {
  const sessionResponse = await auth.api.getSession({
    headers: getRequest().headers,
    query,
    returnHeaders: true,
  });

  // Forward any Set-Cookie headers to the client, e.g. for session/cache refresh
  const cookies = sessionResponse.headers?.getSetCookie();
  if (cookies?.length) {
    setResponseHeader("Set-Cookie", cookies);
  }

  if (!sessionResponse.response) return null;
  return { user: sessionResponse.response.user, session: sessionResponse.response.session };
});
