import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';

import { type AppRouter } from '@/server/api/root';

/**
 * Inference helper for inputs.
 *
 * @example type HelloInput = RouterInputs['example']['hello']
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helper for outputs.
 *
 * @example type HelloOutput = RouterOutputs['example']['hello']
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export type ExpensesListActive = RouterOutputs['expense']['listActive'];
export type ExpensesListArchive = RouterOutputs['expense']['listArchive'];
export type ExpenseById = RouterOutputs['expense']['byId'];
export type ExpenseDebtSettlement = RouterOutputs['expense']['debt']['settlement'];
export type GroupList = RouterOutputs['group']['list'];
export type GroupCurrent = RouterOutputs['group']['current'];
export type UserListNotInCurrentGroup = RouterOutputs['user']['listNotInCurrentGroup'];
export type UserList = RouterOutputs['user']['list'];
export type UserById = RouterOutputs['user']['byId'];
