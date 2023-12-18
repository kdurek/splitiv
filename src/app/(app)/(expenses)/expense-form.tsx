'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { type ExpenseFormSchema, expenseFormSchema } from '@/app/(app)/(expenses)/expense-form.schema';
import { ExpenseFormMethods } from '@/app/(app)/(expenses)/expense-form-methods';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCreateExpense } from '@/hooks/use-create-expense';
import { useUpdateExpense } from '@/hooks/use-update-expense';
import type { GetCurrentGroup, GetExpenseById } from '@/trpc/shared';

interface ExpenseFormProps {
  group: GetCurrentGroup;
  expense?: GetExpenseById;
}

export function ExpenseForm({ group, expense }: ExpenseFormProps) {
  const router = useRouter();
  const { mutate: createExpense, isLoading: isLoadingCreateExpense } = useCreateExpense();
  const { mutate: updateExpense, isLoading: isLoadingUpdateExpense } = useUpdateExpense();

  const defaultValues = expense
    ? {
        name: expense.name || '',
        description: expense.description || '',
        amount: Number(expense.amount) || 0,
        payer: expense.payerId || '',
        debts: group.members.map((member) => ({
          id: member.id,
          name: member.name || '',
          amount: Number(expense.debts.find((debt) => debt.debtorId === member.id)?.amount) || 0,
        })),
      }
    : {
        name: '',
        description: '',
        amount: 0,
        payer: '',
        debts: group.members.map((member) => ({
          id: member.id,
          name: member.name || '',
          amount: 0,
        })),
      };

  const form = useForm({
    defaultValues,
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
            router.push('/');
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
            router.push('/');
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
            {(isLoadingCreateExpense || isLoadingUpdateExpense) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {expense ? 'Edytuj' : 'Dodaj'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
