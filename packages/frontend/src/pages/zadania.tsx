import {
  ActionIcon,
  Box,
  Flex,
  Group,
  Input,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconCheck, IconPlus } from "@tabler/icons";
import { SubmitHandler, useForm } from "react-hook-form";

import GroupSelect from "components/GroupSelect/GroupSelect";
import { useCreateTask } from "hooks/useCreateTask";
import { useDeleteTask } from "hooks/useDeleteTask";
import { useTasksByGroup } from "hooks/useTasksByGroup";
import { useActiveGroup } from "providers/ActiveGroupProvider";

interface CreateTaskValues {
  name: string;
}

function Tasks() {
  const { activeGroupId: groupId } = useActiveGroup();
  const { data: tasks } = useTasksByGroup(groupId);
  const { mutate: createTask } = useCreateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { handleSubmit, register, reset } = useForm<CreateTaskValues>();

  const onSubmit: SubmitHandler<CreateTaskValues> = (values) => {
    const { name } = values;
    createTask({ groupId, name });
    reset();
  };

  return (
    <Stack>
      <Title order={1}>Zadania</Title>
      <GroupSelect />
      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <Group noWrap align="end">
          <Input.Wrapper w="100%" label="Dodaj zadanie">
            <Input
              {...register("name", {
                required: "Pole jest wymagane",
              })}
            />
          </Input.Wrapper>
          <ActionIcon type="submit" size={36} variant="default">
            <IconPlus size={16} />
          </ActionIcon>
        </Group>
      </Box>
      {tasks && (
        <Stack>
          {tasks.map((task) => (
            <Flex key={task.id} justify="space-between">
              <Text w="100%">{task.name}</Text>
              <ActionIcon
                type="button"
                onClick={() => deleteTask({ taskId: task.id })}
                size={36}
                variant="default"
              >
                <IconCheck size={16} />
              </ActionIcon>
            </Flex>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export default Tasks;
