import { Stack, Title } from "@mantine/core";

import {
  ExpenseCreateButtons,
  ExpenseMainList,
  UserBalance,
} from "features/expense";
import { GroupSelect } from "features/group";
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
