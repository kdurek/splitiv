import { ActionIcon, Box, Group, TextInput } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { useForm } from "react-hook-form";

import { useActiveGroup } from "features/group";
import { useCreateTask } from "features/task/api/use-create-task";

interface CreateTaskValues {
  name: string;
}

export function CreateTaskForm() {
  const { activeGroupId } = useActiveGroup();
  const { mutate: createTask } = useCreateTask();
  const { handleSubmit, register, reset } = useForm<CreateTaskValues>();

  const onSubmit = (values: CreateTaskValues) => {
    const { name } = values;
    createTask({ groupId: activeGroupId, name });
    reset();
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Group noWrap align="end">
        <TextInput
          {...register("name", {
            required: "Pole jest wymagane",
          })}
          label="Dodaj zadanie"
          w="100%"
        />
        <ActionIcon type="submit" size={36} variant="default">
          <IconPlus size={16} />
        </ActionIcon>
      </Group>
    </Box>
  );
}
