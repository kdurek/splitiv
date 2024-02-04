'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { api } from '@/trpc/react';

interface ExpenseDeleteModalProps {
  expenseId: string;
}

export function ExpenseDeleteModal({ expenseId }: ExpenseDeleteModalProps) {
  const router = useRouter();
  const { mutate: deleteExpense } = api.expense.delete.useMutation();

  const handleExpenseDelete = () => {
    deleteExpense(
      { expenseId },
      {
        onSuccess() {
          toast.success('Pomyślnie usunięto wydatek');
          router.refresh();
        },
        onError(err) {
          toast.error(err.message);
        },
      },
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Usuń</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Usuwanie wydatku</AlertDialogTitle>
          <AlertDialogDescription>Czy na pewno chcesz usunąć ten wydatek?</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Nie</AlertDialogCancel>
          <AlertDialogAction onClick={handleExpenseDelete}>Tak</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
