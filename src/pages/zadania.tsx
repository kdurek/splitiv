import { Stack, Title } from "@mantine/core";

import CreateTaskForm from "components/CreateTaskForm";
import GroupSelect from "components/GroupSelect";
import TaskList from "components/TaskList";
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
