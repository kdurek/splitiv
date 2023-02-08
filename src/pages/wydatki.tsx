import { Stack, Title } from "@mantine/core";

import ExpenseCreateButtons from "components/ExpenseCreateButtons";
import ExpenseList from "components/ExpenseList";
import GroupSelect from "components/GroupSelect";
import UserBalance from "components/UserBalance";
import ProtectedRoute from "ProtectedRoute";

function ExpensesPage() {
  return (
    <ProtectedRoute>
      <Stack>
        <Title order={1}>Wydatki</Title>
        <GroupSelect />
        <UserBalance />
        <ExpenseCreateButtons />
        <ExpenseList />
      </Stack>
    </ProtectedRoute>
  );
}

export default ExpensesPage;
