import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';

import { type AppRouter } from '@/server/api/root';

export const transformer = superjson;

function getBaseUrl() {
  if (typeof window !== 'undefined') return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export function getUrl() {
  return getBaseUrl() + '/api/trpc';
}

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
