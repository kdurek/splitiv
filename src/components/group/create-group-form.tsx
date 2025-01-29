'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { api } from '@/trpc/react';

const createGroupFormSchema = z.object({
  name: z.string({ required_error: 'Musisz podać nazwę grupy' }).min(3, 'Minimalna długość to 3 znaki'),
});

export function CreateGroupForm() {
  const { mutateAsync: createGroup } = api.group.create.useMutation();
  const { mutate: changeActiveGroup } = api.group.changeCurrent.useMutation();

  const form = useForm({
    resolver: zodResolver(createGroupFormSchema),
    defaultValues: {
      name: '',
    },
  });

  const handleCreateGroup = async (values: z.infer<typeof createGroupFormSchema>) => {
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
