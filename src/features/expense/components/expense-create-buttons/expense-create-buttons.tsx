import { Stack } from "@mantine/core";

import { CreateExpenseModal } from "../expense-form";
import { ExpenseFormRevamped } from "../expense-form-revamped";
import { ExpensePayListModal } from "../expense-pay-list";

export function ExpenseCreateButtons() {
  return (
    <Stack>
      <ExpenseFormRevamped />
      <CreateExpenseModal />
      <ExpensePayListModal />
    </Stack>
  );
}
