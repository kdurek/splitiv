import { Button, Group, NativeSelect, Paper } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useLocalStorage } from "@mantine/hooks";
import { z } from "zod";

import { api } from "utils/api";

const groupSelectFormSchema = z.object({
  groupId: z.string({ required_error: "Musisz wybrać grupę" }),
});

type GroupSelectFormSchema = z.infer<typeof groupSelectFormSchema>;

interface GroupSelectFormProps {
  onSubmit: () => void;
}

export function GroupSelectForm({ onSubmit }: GroupSelectFormProps) {
  const [, setActiveGroupId] = useLocalStorage({
    key: "activeGroupId",
  });

  const form = useForm<GroupSelectFormSchema>({
    validate: zodResolver(groupSelectFormSchema),
  });

  const {
    data: groups,
    isLoading,
    isError,
  } = api.group.getAll.useQuery(undefined, {
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    onSuccess: (data) => {
      form.setValues({ groupId: data[0]?.id });
    },
  });

  const handleGroupSelect = (values: GroupSelectFormSchema) => {
    setActiveGroupId(values.groupId);
    if (onSubmit) {
      onSubmit();
    }
  };

  if (isLoading) return null;
  if (isError) return null;

  const groupsToSelect = groups.map((group) => {
    return { value: group.id, label: group.name };
  });

  return (
    <Paper component="form" onSubmit={form.onSubmit(handleGroupSelect)}>
      <NativeSelect
        mt={16}
        withAsterisk
        label="Wybierz grupę"
        data={groupsToSelect}
        {...form.getInputProps("groupId")}
      />
      <Group mt={24} position="right">
        <Button type="submit">Wybierz</Button>
      </Group>
    </Paper>
  );
}
