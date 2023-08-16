"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "components/ui/form";
import { Input } from "components/ui/input";
import { useChangeActiveGroup } from "hooks/use-change-active-group";
import { useCreateGroup } from "hooks/use-create-group";

const createGroupFormSchema = z.object({
  name: z
    .string({ required_error: "Musisz podać nazwę grupy" })
    .min(3, "Minimalna długość to 3 znaki"),
});

type CreateGroupFormSchema = z.infer<typeof createGroupFormSchema>;

export function CreateGroupForm() {
  const form = useForm<CreateGroupFormSchema>({
    resolver: zodResolver(createGroupFormSchema),
    defaultValues: {
      name: "",
    },
  });
  const { mutateAsync: createGroup } = useCreateGroup();
  const { mutate: changeActiveGroup } = useChangeActiveGroup();

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
        <div className="flex justify-end mt-6">
          <Button>Stwórz</Button>
        </div>
      </form>
    </Form>
  );
}
