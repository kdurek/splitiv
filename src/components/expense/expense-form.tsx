'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { User } from 'lucia';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type z } from 'zod';

import { ExpenseFormMethods } from '@/components/expense/expense-form-methods';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { expenseFormSchema } from '@/lib/validations/expense';
import { api } from '@/trpc/react';
import type { ExpenseById, GroupCurrent } from '@/trpc/shared';

export type ExpenseFormSchema = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  user: User;
  group: GroupCurrent;
  expense?: ExpenseById;
}

export function ExpenseForm({ user, group, expense }: ExpenseFormProps) {
  const router = useRouter();
  const { mutate: createExpense, isPending: isPendingCreateExpense } = api.expense.create.useMutation();
  const { mutate: updateExpense, isPending: isPendingUpdateExpense } = api.expense.update.useMutation();

  const form = useForm({
    defaultValues: {
      name: expense?.name ?? '',
      description: expense?.description ?? '',
      amount: Number(expense?.amount) || 0,
      payer: expense?.payerId ?? user.id ?? '',
      debts: group.members.map((member) => ({
        id: member.id,
        name: member.name ?? '',
        amount: Number(expense?.debts.find((debt) => debt.debtorId === member.id)?.amount) || 0,
      })),
    },
    resolver: zodResolver(expenseFormSchema),
  });

  const handleOnSubmit = (values: ExpenseFormSchema) => {
    const formattedDebts = values.debts
      .filter((debt) => debt.amount !== 0 || (values.payer === debt.id && debt.amount !== 0))
      .map((debt) => {
        const isPayer = values.payer === debt.id;

        return {
          settled: isPayer ? debt.amount : 0,
          amount: values.amount ? debt.amount : 0,
          debtorId: debt.id,
        };
      });

    if (expense) {
      updateExpense(
        {
          expenseId: expense.id,
          name: values.name,
          description: values.description,
          // amount: values.amount,
          // payerId: values.payer,
          // debts: formattedDebts,
        },
        {
          onSuccess() {
            toast.success('Pomyślnie zaktualizowano wydatek');
            router.push(`/`);
          },
          onError(err) {
            toast.error(err.message);
          },
        },
      );
    } else {
      createExpense(
        {
          name: values.name,
          description: values.description,
          amount: values.amount,
          payerId: values.payer,
          debts: formattedDebts,
        },
        {
          onSuccess() {
            toast.success('Pomyślnie dodano wydatek');
            router.push('/');
          },
          onError(err) {
            toast.error(err.message);
          },
        },
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleOnSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Czego dotyczy wydatek?</FormLabel>
              <FormControl>
                <Input placeholder="Krótka nazwa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opcjonalny opis</FormLabel>
              <FormControl>
                <Textarea placeholder="Szczegóły takie jak lista zakupów" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!expense && (
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Całkowita kwota wydatku</FormLabel>
                <FormControl>
                  <NumberInput {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {!expense && (
          <FormField
            control={form.control}
            name="payer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kto zapłacił za wydatek?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz osobę" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {group.members.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {!expense && (
          <div className="flex flex-col gap-4">
            <FormLabel>Kto uczestniczył w wydatku?</FormLabel>
            <ExpenseFormMethods />
          </div>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <Button>
            {(isPendingCreateExpense || isPendingUpdateExpense) && <Loader2 className="mr-2 size-4 animate-spin" />}
            {expense ? 'Edytuj' : 'Dodaj'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
