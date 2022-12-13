import { createTRPCReact } from "@trpc/react-query";
import { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@backend/src/router";

export const trpc = createTRPCReact<AppRouter>();

export type RouterOutput = inferRouterOutputs<AppRouter>;

export type GetUsers = RouterOutput["users"]["getUsers"];
export type GetExpensesByGroup = RouterOutput["groups"]["getExpensesByGroup"];
export type GetGroupById = RouterOutput["groups"]["getGroupById"];
