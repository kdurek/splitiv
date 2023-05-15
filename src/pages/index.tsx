import { Stack, Title } from "@mantine/core";
import { useState } from "react";

import {
  ExpenseList,
  ExpenseListFilters,
  ExpenseListLegend,
  ExpensePayListModal,
  UserBalance,
} from "features/expense";
import { GroupSelect } from "features/group";

import type { ExpenseFilters } from "features/expense";

function ExpensesPage() {
  const [filters, setFilters] = useState<ExpenseFilters>({});

  return (
    <Stack>
      <Title order={1}>Wydatki</Title>
      <GroupSelect />
      <UserBalance />
      <ExpensePayListModal />
      <ExpenseListLegend />
      <ExpenseListFilters setFilters={setFilters} />
      <ExpenseList filters={filters} />
    </Stack>
  );
}

export default ExpensesPage;
