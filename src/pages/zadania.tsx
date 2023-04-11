import { Stack, Title } from "@mantine/core";

import GroupSelect from "components/GroupSelect";
import { CreateTaskForm, TaskList } from "features/task";
import ProtectedContent from "ProtectedContent";

function TasksPage() {
  return (
    <ProtectedContent>
      <Stack>
        <Title order={1}>Zadania</Title>
        <GroupSelect />
        <CreateTaskForm />
        <TaskList />
      </Stack>
    </ProtectedContent>
  );
}

export default TasksPage;
