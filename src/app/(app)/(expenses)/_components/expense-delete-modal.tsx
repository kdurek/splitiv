'use client';

import { useDeleteExpense } from '@/app/_components/hooks/use-delete-expense';
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
} from '@/app/_components/ui/alert-dialog';
import { Button } from '@/app/_components/ui/button';

interface ExpenseDeleteModalProps {
  expenseId: string;
}

export function ExpenseDeleteModal({ expenseId }: ExpenseDeleteModalProps) {
  const { mutate: deleteExpense } = useDeleteExpense();

  const handleExpenseDelete = () => {
    deleteExpense({ expenseId });
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
