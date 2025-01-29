'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { NumberInput } from '@/components/ui/number-input';
import { api } from '@/trpc/react';

const expensePaymentFormSchema = z.object({
  amount: z.number({ required_error: 'Musisz wpisać kwotę' }).positive({ message: 'Kwota musi być większa niż zero' }),
});

export function ExpenseDebtSettleModal({
  children,
  debtId,
  amount,
  settled,
}: {
  children: React.ReactNode;
  debtId: string;
  amount: number;
  settled: number;
}) {
  const { mutate: settleByAmount, isPending: isPendingUpdateExpenseDebt } =
    api.expense.debt.settleByAmount.useMutation();

  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(expensePaymentFormSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const maximumAmount = amount - settled;

  const handleSettleExpenseDebt = (values: z.infer<typeof expensePaymentFormSchema>) => {
    settleByAmount(
      {
        debtId,
        amount: values.amount,
      },
      {
        onSuccess() {
          toast.success('Pomyślnie oddano kwotę');
          setOpen(false);
          form.reset();
        },
        onError(error) {
          form.setError('amount', { message: error.shape?.message });
          toast.error('Nie udało się oddać kwoty');
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={() => setOpen(!open)}>
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
            {isPendingUpdateExpenseDebt && <Loader2 className="mr-2 size-4 animate-spin" />}
            Oddaj
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
