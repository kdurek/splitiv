import { createTRPCReact } from "@trpc/react-query";
import { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@backend/src/router";

export const trpc = createTRPCReact<AppRouter>();

export type RouterOutput = inferRouterOutputs<AppRouter>;

export type GetUser = RouterOutput["user"]["getUser"];
export type GetUsers = RouterOutput["user"]["getUsers"];
export type GetExpensesByGroup = RouterOutput["expense"]["getExpensesByGroup"];
export type GetGroupById = RouterOutput["group"]["getGroupById"];
