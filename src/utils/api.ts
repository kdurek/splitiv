"use client";

import { createTRPCReact } from "@trpc/react-query";

import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "server/api/root";

export const api = createTRPCReact<AppRouter>();

export type RouterInputs = inferRouterInputs<AppRouter>;

export type RouterOutputs = inferRouterOutputs<AppRouter>;
export type GetInfiniteExpenses = RouterOutputs["expense"]["getInfinite"];
export type GetExpensesByGroup = RouterOutputs["expense"]["getAll"];
export type GetPaymentSettle = RouterOutputs["user"]["getPaymentSettle"];
export type GetUserDebts = RouterOutputs["user"]["getDebts"];
export type GetGroups = RouterOutputs["group"]["getAll"];
export type GetGroupById = RouterOutputs["group"]["getById"];
export type GetUsers = RouterOutputs["user"]["getAll"];
export type GetUserById = RouterOutputs["user"]["getById"];
