import { Stack } from "@mantine/core";

import CreateExpenseModal from "components/ExpenseForm/CreateExpenseModal";
import ExpenseFormRevamped from "components/ExpenseFormRevamped/ExpenseFormRevamped";
import ExpensePayListModal from "components/ExpensePayList/ExpensePayListModal";

function ExpenseCreateButtons() {
  return (
    <Stack>
      <ExpenseFormRevamped />
      <CreateExpenseModal />
      <ExpensePayListModal />
    </Stack>
  );
}

export default ExpenseCreateButtons;
