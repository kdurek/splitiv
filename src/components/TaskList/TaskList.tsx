import { ActionIcon, Group, Stack, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

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
        <Group key={task.id} position="apart">
          <Text>{task.name}</Text>
          <ActionIcon
            type="button"
            onClick={() => deleteTask({ taskId: task.id, groupId })}
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

export default TaskList;
