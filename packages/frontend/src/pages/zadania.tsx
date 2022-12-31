import { Stack, Title } from "@mantine/core";

import GroupSelect from "components/GroupSelect/GroupSelect";
import CreateTaskForm from "components/task/CreateTaskForm";
import TaskList from "components/task/TaskList";

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
