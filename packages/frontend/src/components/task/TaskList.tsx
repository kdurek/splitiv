import { ActionIcon, Flex, Stack, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons";

import { useDeleteTask } from "hooks/useDeleteTask";
import { useTasksByGroup } from "hooks/useTasksByGroup";
import { useActiveGroup } from "providers/ActiveGroupProvider";

function TaskList() {
  const { activeGroupId: groupId } = useActiveGroup();
  const { data: tasks } = useTasksByGroup(groupId);
  const { mutate: deleteTask } = useDeleteTask();

  if (!tasks) return null;

  return (
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
  );
}

export default TaskList;
