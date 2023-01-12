import { Stack, Title } from "@mantine/core";

import CreateTaskForm from "components/CreateTaskForm";
import GroupSelect from "components/GroupSelect";
import TaskList from "components/TaskList";

function Tasks() {
  return (
    <Stack>
      <Title order={1}>Zadania</Title>
      <GroupSelect />
      <CreateTaskForm />
      <TaskList />
    </Stack>
  );
}

export default Tasks;
