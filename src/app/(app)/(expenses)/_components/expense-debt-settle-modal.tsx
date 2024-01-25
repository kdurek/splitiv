'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useDisclosure } from '@/app/_components/hooks/use-disclosure';
import { useUpdateExpenseDebt } from '@/app/_components/hooks/use-update-expense-debt';
import { Button } from '@/app/_components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/app/_components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/app/_components/ui/form';
import { NumberInput } from '@/app/_components/ui/number-input';
import { expensePaymentFormSchema } from '@/lib/validations/expense-payment';

type ExpensePaymentFormSchema = z.infer<typeof expensePaymentFormSchema>;

interface ExpenseDebtSettleModalProps {
  children: React.ReactNode;
  debtId: string;
  amount: number;
  settled: number;
}

export function ExpenseDebtSettleModal({ children, debtId, amount, settled }: ExpenseDebtSettleModalProps) {
  const [open, { toggle, close }] = useDisclosure(false);

  const { mutate: updateExpenseDebt, isPending: isPendingUpdateExpenseDebt } = useUpdateExpenseDebt();

  const form = useForm<ExpensePaymentFormSchema>({
    defaultValues: {
      amount: 0,
    },
    resolver: zodResolver(expensePaymentFormSchema),
  });

  const maximumAmount = amount - settled;

  const handleSettleExpenseDebt = (values: ExpensePaymentFormSchema) => {
    updateExpenseDebt(
      {
        id: debtId,
        settled: values.amount + settled,
      },
      {
        onSuccess() {
          close();
          form.reset();
        },
        onError(error) {
          form.setError('amount', { message: error.shape?.message });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={toggle}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Jaką kwotę chcesz oddać?</DialogTitle>
          <DialogDescription>Pozostało do oddania {maximumAmount.toFixed(2)} zł</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form id="expense-payment-form" className="space-y-6" onSubmit={form.handleSubmit(handleSettleExpenseDebt)}>
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem className="mx-auto">
                  <FormControl>
                    <NumberInput max={maximumAmount} {...field} />
                  </FormControl>
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button form="expense-payment-form">
            {isPendingUpdateExpenseDebt && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Oddaj
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
