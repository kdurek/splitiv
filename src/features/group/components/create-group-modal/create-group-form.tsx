import { Button, Group, Paper, TextInput } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useLocalStorage } from "@mantine/hooks";
import { z } from "zod";

import { useCreateGroup } from "features/group/api/use-create-group";

const createGroupFormSchema = z.object({
  name: z
    .string({ required_error: "Musisz podać nazwę grupy" })
    .min(3, "Minimalna długość to 3 znaki"),
});

type CreateGroupFormSchema = z.infer<typeof createGroupFormSchema>;

interface CreateGroupFormProps {
  onSubmit?: () => void;
}

export function CreateGroupForm({ onSubmit }: CreateGroupFormProps) {
  const [, setActiveGroupId] = useLocalStorage({
    key: "activeGroupId",
  });

  const form = useForm<CreateGroupFormSchema>({
    initialValues: {
      name: "",
    },
    validate: zodResolver(createGroupFormSchema),
  });
  const { mutate: createGroup } = useCreateGroup();

  const handleCreateGroup = (values: CreateGroupFormSchema) => {
    createGroup(
      { name: values.name },
      {
        onSuccess: (data) => {
          setActiveGroupId(data.id);
          if (onSubmit) {
            onSubmit();
          }
        },
      }
    );
  };

  return (
    <Paper component="form" onSubmit={form.onSubmit(handleCreateGroup)}>
      <TextInput
        withAsterisk
        label="Nazwa grupy"
        {...form.getInputProps("name")}
      />
      <Group mt={24} position="right">
        <Button variant="default" type="submit">
          Stwórz
        </Button>
      </Group>
    </Paper>
  );
}
