import { createMiddleware } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";

import { _getSession } from "./functions";

// https://tanstack.com/start/latest/docs/framework/react/guide/middleware

/**
 * Middleware to force authentication on server requests (including server functions), and add the user and session to the context.
 *
 * Follows the cookieCache option in the auth config (template default: 5 mins).
 * This is recommended for most cases, like route-level data fetching operations where some staleness may be acceptable and reduced server load is beneficial.
 *
 * @see https://better-auth.com/docs/concepts/session-management#cookie-cache
 */
export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await _getSession();

  if (!result) {
    setResponseStatus(401);
    throw new Error("Unauthorized");
  }

  return next({ context: { user: result.user, session: result.session } });
});

/**
 * Middleware to force authentication on server requests (including server functions), and add the user and session to the context.
 *
 * Auth cookie cache is disabled, and fresh user session is always fetched from database.
 * This is recommended for sensitive/destructive operations and mutations that require the freshest auth state, e.g. to prevent a user from performing an action after their session has expired or been revoked.
 *
 * @see https://better-auth.com/docs/concepts/session-management#cookie-cache
 */
export const freshAuthMiddleware = createMiddleware().server(async ({ next }) => {
  const result = await _getSession({
    // ensure session is fresh
    // https://better-auth.com/docs/concepts/session-management#cookie-cache
    disableCookieCache: true,
  });

  if (!result) {
    setResponseStatus(401);
    throw new Error("Unauthorized");
  }

  return next({ context: { user: result.user, session: result.session } });
});
