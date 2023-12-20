import { type inferRouterInputs, type inferRouterOutputs } from '@trpc/server';
import superjson from 'superjson';

import { type AppRouter } from '@/server/api/root';

export const transformer = superjson;

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
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

export type GetInfiniteExpenses = RouterOutputs['expense']['getInfinite'];
export type GetAllExpenses = RouterOutputs['expense']['getAll'];
export type GetExpenseById = RouterOutputs['expense']['getById'];
export type GetPaymentSettle = RouterOutputs['user']['getPaymentSettle'];
export type GetGroups = RouterOutputs['group']['getAll'];
export type GetCurrentGroup = RouterOutputs['group']['getCurrent'];
export type GetUsers = RouterOutputs['user']['getAll'];
export type GetUserById = RouterOutputs['user']['getById'];
