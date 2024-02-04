'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { expenseNoteFormSchema } from '@/lib/validations/expense-note';
import { api } from '@/trpc/react';

type ExpenseNoteFormSchema = z.infer<typeof expenseNoteFormSchema>;

interface ExpenseNoteFormProps {
  expenseId: string;
}

export function ExpenseNoteForm({ expenseId }: ExpenseNoteFormProps) {
  const router = useRouter();
  const { mutate: createExpenseNote } = api.expense.note.create.useMutation();

  const form = useForm<ExpenseNoteFormSchema>({
    defaultValues: {
      content: '',
    },
    resolver: zodResolver(expenseNoteFormSchema),
  });

  const handleCreateExpenseNote = (values: ExpenseNoteFormSchema) => {
    createExpenseNote(
      { expenseId, content: values.content },
      {
        onSuccess() {
          toast.success('Pomyślnie dodano notatkę');
          form.reset();
          router.refresh();
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleCreateExpenseNote)} className="space-y-2">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input {...field} placeholder="O czym chcesz wspomnieć?" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="w-full">Dodaj</Button>
      </form>
    </Form>
  );
}
