import { ActionIcon, Box, Group, TextInput } from "@mantine/core";
import { IconPlus } from "@tabler/icons";
import { SubmitHandler, useForm } from "react-hook-form";

import { useCreateTask } from "hooks/useCreateTask";
import { useActiveGroup } from "providers/ActiveGroupProvider";

interface CreateTaskValues {
  name: string;
}

function CreateTaskForm() {
  const { activeGroupId: groupId } = useActiveGroup();
  const { mutate: createTask } = useCreateTask();
  const { handleSubmit, register, reset } = useForm<CreateTaskValues>();

  const onSubmit: SubmitHandler<CreateTaskValues> = (values) => {
    const { name } = values;
    createTask({ groupId, name });
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

export default CreateTaskForm;