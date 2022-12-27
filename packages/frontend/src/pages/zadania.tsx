import {
  Divider,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Input,
  Skeleton,
  Stack,
  Text,
} from "@chakra-ui/react";
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
  const { data: tasks, isSuccess: isSuccessTasks } = useTasksByGroup(groupId);
  const { mutate: createTask } = useCreateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { handleSubmit, register, reset } = useForm<CreateTaskValues>();

  const onSubmit: SubmitHandler<CreateTaskValues> = (values) => {
    const { name } = values;
    createTask({ groupId, name });
    reset();
  };

  return (
    <Stack spacing={4}>
      <Heading>Zadania</Heading>
      <GroupSelect />
      <Divider />
      <HStack
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        justify="space-between"
      >
        <FormControl>
          <FormLabel htmlFor="name">Dodaj zadanie</FormLabel>
          <Input
            {...register("name", {
              required: "Pole jest wymagane",
            })}
          />
        </FormControl>
        <IconButton
          type="submit"
          aria-label="done"
          icon={<IconPlus />}
          alignSelf="end"
        />
      </HStack>
      <Skeleton isLoaded={isSuccessTasks}>
        {tasks && (
          <Stack mt={4} spacing={4}>
            {tasks.map((task) => (
              <HStack key={task.id} justify="space-between">
                <Text>{task.name}</Text>
                <IconButton
                  aria-label="done"
                  icon={<IconCheck />}
                  onClick={() => deleteTask({ taskId: task.id })}
                />
              </HStack>
            ))}
          </Stack>
        )}
      </Skeleton>
    </Stack>
  );
}

export default Tasks;
