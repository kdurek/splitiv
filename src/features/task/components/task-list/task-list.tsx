import { ActionIcon, Group, Stack, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

import { useDeleteTask } from "features/task/api/use-delete-task";
import { useTasksByGroup } from "features/task/api/use-tasks-by-group";
import { useActiveGroup } from "providers/ActiveGroupProvider";

export function TaskList() {
  const { activeGroupId } = useActiveGroup();
  const { data: tasks } = useTasksByGroup(activeGroupId);
  const { mutate: deleteTask } = useDeleteTask();

  if (!tasks) return null;

  return (
    <Stack>
      {tasks.map((task) => (
        <Group key={task.id} position="apart">
          <Text>{task.name}</Text>
          <ActionIcon
            type="button"
            onClick={() =>
              deleteTask({ taskId: task.id, groupId: activeGroupId })
            }
            size={36}
            variant="default"
          >
            <IconCheck size={16} />
          </ActionIcon>
        </Group>
      ))}
    </Stack>
  );
}
