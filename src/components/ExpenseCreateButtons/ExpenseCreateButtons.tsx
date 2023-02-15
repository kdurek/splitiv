import { Stack } from "@mantine/core";

import CreateExpenseModal from "components/ExpenseForm/CreateExpenseModal";
import ExpensePayListModal from "components/ExpensePayList/ExpensePayListModal";

function ExpenseCreateButtons() {
  return (
    <Stack>
      <CreateExpenseModal />
      <ExpensePayListModal />
    </Stack>
  );
}

export default ExpenseCreateButtons;
