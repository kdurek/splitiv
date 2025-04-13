'use client';

import type { ReactNode } from 'react';

import type { ExpensesList } from '@/trpc/react';

interface ExpensesListProps {
  children: ReactNode;
}

export function ExpensesList({ children }: ExpensesListProps) {
  return <div className="grid gap-2">{children}</div>;
}
