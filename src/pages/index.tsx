import { Stack, Title } from "@mantine/core";

import ExpenseWidgetList from "components/ExpenseList/ExpenseWidgetList";

function HomePage() {
  return (
    <Stack>
      <Title order={1}>Strona główna</Title>
      <ExpenseWidgetList />
    </Stack>
  );
}

export default HomePage;
