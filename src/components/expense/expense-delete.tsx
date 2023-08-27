'use client';

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
import { useDeleteExpense } from '@/hooks/use-delete-expense';

interface ExpenseDeleteProps {
  expenseId: string;
}

export function ExpenseDelete({ expenseId }: ExpenseDeleteProps) {
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
