import { Stack, Title } from "@mantine/core";

import GroupSelect from "components/GroupSelect";
import {
  ExpenseCreateButtons,
  ExpenseMainList,
  UserBalance,
} from "features/expense";
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
