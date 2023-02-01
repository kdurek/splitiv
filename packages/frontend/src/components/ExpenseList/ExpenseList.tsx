import { Accordion, Checkbox, Paper, Stack, Text } from "@mantine/core";
import { useToggle } from "@mantine/hooks";

import { useExpenses } from "hooks/useExpenses";
import { useGroup } from "hooks/useGroup";
import { useActiveGroup } from "providers/ActiveGroupProvider";
import { useAuth } from "providers/AuthProvider";

import ExpenseCard from "./ExpenseCard";

function ExpenseList() {
  const { user } = useAuth();
  const [onlyUserDebts, toggleOnlyUserDebts] = useToggle();
  const { activeGroupId: groupId } = useActiveGroup();
  const { data: group } = useGroup(groupId);
  const { data: expenses } = useExpenses(groupId);

  if (!group || !expenses) return null;

  const filteredExpenses = expenses.filter(
    (expense) =>
      !onlyUserDebts ||
      expense.debts.some(
        (debt) =>
          debt.debtorId === user?.id &&
          debt.debtorId !== debt.expense.payerId &&
          debt.settled !== debt.amount
      )
  );

  return (
    <Stack>
      <Checkbox
        label="Moje długi"
        checked={onlyUserDebts}
        onChange={() => toggleOnlyUserDebts()}
      />
      {filteredExpenses.length ? (
        <Accordion variant="contained">
          {filteredExpenses.map((expense) => (
            <ExpenseCard key={expense.id} group={group} expense={expense} />
          ))}
        </Accordion>
      ) : (
        <Paper withBorder p="md">
          <Text>Nie masz żadnych długów</Text>
        </Paper>
      )}
    </Stack>
  );
}

export default ExpenseList;
