'use client';

import { type Prisma } from '@prisma/client';
import { format } from 'date-fns';
import Link from 'next/link';
import type { Session } from 'next-auth';

import { buttonVariants } from '@/app/_components/ui/button';
import { Heading } from '@/app/_components/ui/heading';
import { ExpenseDebtorCard, ExpensePayerCard } from '@/app/(app)/(expenses)/_components/expense-debts';
import { ExpenseDeleteModal } from '@/app/(app)/(expenses)/_components/expense-delete-modal';
import { ExpenseDescriptionCard } from '@/app/(app)/(expenses)/_components/expense-description-card';
import { ExpenseNoteCard } from '@/app/(app)/(expenses)/_components/expense-note-card';
import { ExpenseNoteForm } from '@/app/(app)/(expenses)/_components/expense-note-form';
import { cn } from '@/lib/utils';

interface ExpenseDetailProps {
  expense: Prisma.ExpenseGetPayload<{
    include: {
      debts: {
        include: {
          debtor: true;
        };
      };
      group: true;
      payer: true;
      notes: {
        include: {
          createdBy: true;
        };
      };
    };
  }>;
  session: Session;
}

export function ExpenseDetail({ expense, session }: ExpenseDetailProps) {
  const formattedDate = format(expense.createdAt, 'EEEEEEE, d MMMM yyyy');
  const isPayer = session.user.id === expense.payerId;
  const isAdmin = session.user.id === expense.group.adminId;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Heading variant="h1">{expense.name}</Heading>
        <ExpenseDescriptionCard description={expense.description} />
        <div>{formattedDate}</div>
      </div>

      <div className="divide-y">
        <ExpensePayerCard name={expense.payer.name} amount={Number(expense.amount)} />
        {expense.debts.map((debt) => (
          <ExpenseDebtorCard
            key={debt.id}
            debtId={debt.id}
            name={debt.debtor.name}
            amount={Number(debt.amount)}
            settled={Number(debt.settled)}
            canSettle={
              debt.amount !== debt.settled && (isAdmin || isPayer || (session.user.id === debt.debtorId && !isPayer))
            }
          />
        ))}
      </div>

      <div className="space-y-2">
        <Heading variant="h2">Notatki</Heading>
        <ExpenseNoteForm expenseId={expense.id} />
        <div className="divide-y">
          {expense.notes.length !== 0 ? (
            expense.notes.map((note) => (
              <ExpenseNoteCard
                key={note.id}
                content={note.content}
                createdByName={note.createdBy?.name}
                createdAt={note.createdAt}
              />
            ))
          ) : (
            <div className="py-4">Nie dodano jeszcze żadnej notatki</div>
          )}
        </div>
      </div>

      {(isPayer || isAdmin) && (
        <div className="space-y-2">
          <Heading variant="h2">Ustawienia</Heading>
          <div className="flex gap-2">
            <Link
              href={`/wydatki/${expense.id}/edytuj`}
              className={cn(buttonVariants({ variant: 'outline' }), 'w-full')}
            >
              Edytuj
            </Link>
            <ExpenseDeleteModal expenseId={expense.id} />
          </div>
        </div>
      )}
    </div>
  );
}
