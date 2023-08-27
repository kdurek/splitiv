import { format } from 'date-fns';
import { CircleDollarSign } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { ExpenseDelete } from '@/components/expense/expense-delete';
import { ExpensePayment } from '@/components/expense/expense-payment';
import { ExpenseNoteForm } from '@/components/forms/expense-note-form';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { cn } from '@/lib/utils';
import { createTrpcCaller } from '@/server/api/caller';
import { getServerAuthSession } from '@/server/auth';

interface ExpensePageProps {
  params: {
    expenseId: string;
  };
}

export default async function ExpensePage({ params }: ExpensePageProps) {
  const session = await getServerAuthSession();

  if (!session) {
    redirect('/logowanie');
  }

  const caller = await createTrpcCaller();
  const expense = await caller.expense.getById({ id: params.expenseId });

  if (!expense) {
    redirect('/');
  }

  const descriptionParts = expense.description?.split('\n');
  const hasDescription = descriptionParts?.length;
  const formattedDate = format(expense.createdAt, 'EEEEEEE, d MMMM yyyy');
  const isPayer = session.user.id === expense.payerId;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Heading variant="h1">{expense.name}</Heading>
        {hasDescription && (
          <div className="text-sm text-muted-foreground">
            {descriptionParts?.map((part, index) => <div key={index}>{part}</div>)}
          </div>
        )}
        <div>{formattedDate}</div>
      </div>

      <div className="space-y-2">
        <div className="w-full rounded-md border p-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="grid h-10 w-10 shrink-0 place-content-center rounded-md bg-slate-100">
                <CircleDollarSign className="text-slate-500" />
              </div>
              <div className="overflow-hidden text-start">
                <div className="line-clamp-1 text-xs font-medium uppercase text-muted-foreground">Zapłacone</div>
                <div className="line-clamp-1">{expense.payer.name}</div>
              </div>
            </div>
            <div className="text-end">
              <div className="line-clamp-1 text-xs font-medium uppercase text-muted-foreground">Kwota</div>
              <div className="whitespace-nowrap">{Number(expense.amount).toFixed(2)} zł</div>
            </div>
          </div>
        </div>
        {expense.debts.map((debt) => (
          <ExpensePayment key={debt.id} payerId={expense.payerId} debt={debt} />
        ))}
      </div>

      <div className="space-y-2">
        <Heading variant="h2">Nowa notatka</Heading>
        <ExpenseNoteForm expenseId={expense.id} />
      </div>

      <div className="space-y-2">
        <Heading variant="h2">Notatki</Heading>
        <div className="divide-y">
          {expense.notes.length !== 0 ? (
            expense.notes.map((note) => (
              <div key={note.id} className="space-y-2 py-2">
                <div>{note.content}</div>
                <div className="flex justify-between gap-4">
                  <div className="text-start text-sm text-muted-foreground">{note.createdBy?.name}</div>
                  <div className="text-end text-sm text-muted-foreground">
                    {format(note.createdAt, 'HH:mm dd.MM.yyyy')}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-2">Nie dodano jeszcze żadnej notatki</div>
          )}
        </div>
      </div>

      {isPayer && (
        <div className="space-y-2">
          <Heading variant="h2">Ustawienia</Heading>
          <div className="flex gap-2">
            <Link href={`/wydatki/${expense.id}/edytuj`} className={cn(buttonVariants({ variant: 'outline' }))}>
              Edytuj
            </Link>
            <ExpenseDelete expenseId={expense.id} />
          </div>
        </div>
      )}
    </div>
  );
}
