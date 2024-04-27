'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { updateUserFormSchema } from '@/lib/validations/user';
import { api } from '@/trpc/react';
import { type UserById } from '@/trpc/react';

type UpdateUserFormSchema = z.infer<typeof updateUserFormSchema>;

interface UserFormProps {
  user: UserById;
}

export function UserForm({ user }: UserFormProps) {
  const form = useForm<UpdateUserFormSchema>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: {
      name: user?.name ?? '',
    },
  });

  const { mutate: updateUser } = api.user.update.useMutation();

  const handleUpdateUser = async (values: UpdateUserFormSchema) => {
    if (user) {
      updateUser(
        { userId: user.id, name: values.name },
        {
          onSuccess() {
            toast.success('Pomyślnie zaktualizowano użytkownika');
          },
        },
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleUpdateUser)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imię i nazwisko</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-6 flex justify-end">
          <Button>Zapisz</Button>
        </div>
      </form>
    </Form>
  );
}
