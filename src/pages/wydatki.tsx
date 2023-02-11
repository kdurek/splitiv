import { Stack, Title } from "@mantine/core";

import ExpenseCreateButtons from "components/ExpenseCreateButtons";
import ExpenseMainList from "components/ExpenseList/ExpenseMainList";
import GroupSelect from "components/GroupSelect";
import UserBalance from "components/UserBalance";
import ProtectedContent from "ProtectedContent";

function ExpensesPage() {
  return (
    <ProtectedContent>
      <Stack>
        <Title order={1}>Wydatki</Title>
        <GroupSelect />
        <UserBalance />
        <ExpenseCreateButtons />
        <ExpenseMainList />
      </Stack>
    </ProtectedContent>
  );
}

export default ExpensesPage;
