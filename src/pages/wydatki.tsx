import { Stack, Title } from "@mantine/core";

import { ProtectedContent } from "features/auth";
import {
  ExpenseMainList,
  ExpensePayListModal,
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
          <ExpensePayListModal />
          <ExpenseMainList />
        </Stack>
      </ProtectedContent>
    </Stack>
  );
}

export default ExpensesPage;
