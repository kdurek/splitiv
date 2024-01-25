'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useUpdateUser } from '@/app/_components/hooks/use-update-user';
import { Button } from '@/app/_components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/app/_components/ui/form';
import { Input } from '@/app/_components/ui/input';
import { updateUserFormSchema } from '@/lib/validations/user';
import { UserById } from '@/trpc/shared';

type UpdateUserFormSchema = z.infer<typeof updateUserFormSchema>;

interface UserFormProps {
  user: UserById;
}

export function UserForm({ user }: UserFormProps) {
  const defaultValues = user
    ? {
        name: user.name || '',
      }
    : {
        name: '',
      };

  const form = useForm<UpdateUserFormSchema>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues,
  });

  const { mutate: updateUser } = useUpdateUser();

  const handleUpdateUser = async (values: UpdateUserFormSchema) => {
    if (user) {
      updateUser({ userId: user.id, name: values.name });
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
