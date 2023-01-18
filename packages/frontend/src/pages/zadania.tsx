import { Stack, Title } from "@mantine/core";

import CreateTaskForm from "components/CreateTaskForm";
import GroupSelect from "components/GroupSelect";
import TaskList from "components/TaskList";
import ProtectedRoute from "ProtectedRoute";

function TasksPage() {
  return (
    <ProtectedRoute>
      <Stack>
        <Title order={1}>Zadania</Title>
        <GroupSelect />
        <CreateTaskForm />
        <TaskList />
      </Stack>
    </ProtectedRoute>
  );
}

export default TasksPage;
