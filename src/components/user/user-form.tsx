'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { updateUserFormSchema } from '@/lib/validations/user';
import { api } from '@/trpc/react';

type UpdateUserFormSchema = z.infer<typeof updateUserFormSchema>;

export function UserForm() {
  const router = useRouter();

  const [currentUser] = api.user.current.useSuspenseQuery();

  const form = useForm<UpdateUserFormSchema>({
    resolver: zodResolver(updateUserFormSchema),
    defaultValues: {
      name: currentUser?.name ?? '',
      firstName: currentUser?.firstName ?? '',
      lastName: currentUser?.lastName ?? '',
    },
  });

  const { mutate: updateUser } = api.user.update.useMutation();

  const handleUpdateUser = async (values: UpdateUserFormSchema) => {
    if (currentUser) {
      updateUser(
        {
          name: values.name,
          firstName: values.firstName,
          lastName: values.lastName,
        },
        {
          onSuccess() {
            toast.success('Pomyślnie zaktualizowano użytkownika');
            router.push('/ustawienia');
          },
        },
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleUpdateUser)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwa</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imię</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwisko</FormLabel>
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
