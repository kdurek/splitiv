import { Stack, Title } from "@mantine/core";

import { ProtectedContent } from "features/auth";
import {
  ExpenseCreateButtons,
  ExpenseMainList,
  UserBalance,
} from "features/expense";
import { GroupSelect } from "features/group";

function ExpensesPage() {
  return (
    <Stack>
      <Title order={1}>Wydatki</Title>
      <ProtectedContent>
        <Stack>
          <GroupSelect />
          <UserBalance />
          <ExpenseCreateButtons />
          <ExpenseMainList />
        </Stack>
      </ProtectedContent>
    </Stack>
  );
}

export default ExpensesPage;
