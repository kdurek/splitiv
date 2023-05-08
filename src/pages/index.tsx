import { Stack, Title } from "@mantine/core";

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
      <GroupSelect />
      <UserBalance />
      <ExpensePayListModal />
      <ExpenseMainList />
    </Stack>
  );
}

export default ExpensesPage;
