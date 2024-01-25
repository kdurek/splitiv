'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useChangeCurrentGroup } from '@/app/_components/hooks/use-change-current-group';
import { useCreateGroup } from '@/app/_components/hooks/use-create-group';
import { Button } from '@/app/_components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/app/_components/ui/form';
import { Input } from '@/app/_components/ui/input';
import { createGroupFormSchema } from '@/lib/validations/group';

type CreateGroupFormSchema = z.infer<typeof createGroupFormSchema>;

export function CreateGroupForm() {
  const form = useForm<CreateGroupFormSchema>({
    resolver: zodResolver(createGroupFormSchema),
    defaultValues: {
      name: '',
    },
  });
  const { mutateAsync: createGroup } = useCreateGroup();
  const { mutate: changeActiveGroup } = useChangeCurrentGroup();

  const handleCreateGroup = async (values: CreateGroupFormSchema) => {
    const createdGroup = await createGroup({ name: values.name });
    changeActiveGroup({ groupId: createdGroup.id });
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
