import { Stack } from "@mantine/core";

import { ExpenseForm } from "../expense-form";
import { ExpensePayListModal } from "../expense-pay-list";

export function ExpenseCreateButtons() {
  return (
    <Stack>
      <ExpenseForm />
      <ExpensePayListModal />
    </Stack>
  );
}
