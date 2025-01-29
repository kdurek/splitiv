'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { changePasswordFormSchema } from '@/lib/validations/auth';
import { api } from '@/trpc/react';

export function ChangePasswordForm() {
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(changePasswordFormSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { mutate: changePassword, isPending: isPendingChangePassword } = api.user.changePassword.useMutation();

  const handleChangePassword = async (values: z.infer<typeof changePasswordFormSchema>) => {
    changePassword(
      {
        currentPassword: values.currentPassword,
        password: values.password,
      },
      {
        onSuccess() {
          toast.success('Pomyślnie zaktualizowano hasło');
          router.push('/ustawienia');
        },
        onError(err) {
          toast.error(err.message);
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleChangePassword)} className="space-y-6">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Aktualne hasło</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hasło</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Potwierdź hasło</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-6 flex justify-end">
          <Button disabled={isPendingChangePassword}>Zmień hasło</Button>
        </div>
      </form>
    </Form>
  );
}
