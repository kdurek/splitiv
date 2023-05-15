import { Stack } from "@mantine/core";
import { useState } from "react";

import {
  ExpenseList,
  ExpenseListFilters,
  ExpenseListLegend,
  ExpensePayListModal,
  UserBalance,
} from "features/expense";
import { Section } from "features/layout";

import type { ExpenseFilters } from "features/expense";

function ExpensesPage() {
  const [filters, setFilters] = useState<ExpenseFilters>({});

  return (
    <Section title="Wydatki">
      <Stack>
        <UserBalance />
        <ExpensePayListModal />
        <ExpenseListLegend />
        <ExpenseListFilters setFilters={setFilters} />
        <ExpenseList filters={filters} />
      </Stack>
    </Section>
  );
}

export default ExpensesPage;
