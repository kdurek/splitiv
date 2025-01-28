'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { type z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createGroupFormSchema } from '@/lib/validations/group';
import { api } from '@/trpc/react';

type CreateGroupFormSchema = z.infer<typeof createGroupFormSchema>;

export function CreateGroupForm() {
  const { mutateAsync: createGroup } = api.group.create.useMutation();
  const { mutate: changeActiveGroup } = api.group.changeCurrent.useMutation();

  const form = useForm<CreateGroupFormSchema>({
    resolver: zodResolver(createGroupFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const handleCreateGroup = async (values: CreateGroupFormSchema) => {
    const createdGroup = await createGroup(
      {
        name: values.name,
      },
      {
        onSuccess() {
          toast.success('Pomyślnie utworzono grupę');
        },
      },
    );
    changeActiveGroup(
      { groupId: createdGroup.id },
      {
        onSuccess() {
          toast.success('Pomyślnie zmieniono grupę');
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleCreateGroup)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nazwa grupy</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-6 flex justify-end">
          <Button>Stwórz</Button>
        </div>
      </form>
    </Form>
  );
}
