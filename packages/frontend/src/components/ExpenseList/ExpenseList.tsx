import {
  Accordion,
  Checkbox,
  Divider,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { useToggle } from "@mantine/hooks";

import { useCurrentUser } from "hooks/useCurrentUser";
import { useExpenses } from "hooks/useExpenses";
import { useGroup } from "hooks/useGroup";
import { useActiveGroup } from "providers/ActiveGroupProvider";

import ExpenseCard from "./ExpenseCard";

function ExpenseList() {
  const { data: user } = useCurrentUser();
  const [onlyUserDebts, toggleOnlyUserDebts] = useToggle();
  const { activeGroupId: groupId } = useActiveGroup();
  const { data: group } = useGroup(groupId);
  const { data: expenses } = useExpenses(groupId);

  if (!user || !group || !expenses) return null;

  const unsettledExpenses = expenses
    .filter((expense) =>
      expense.debts.some((debt) => debt.settled !== debt.amount)
    )
    .filter((expense) =>
      onlyUserDebts
        ? expense.debts.some(
            (debt) =>
              debt.debtorId === user?.id &&
              debt.debtorId !== debt.expense.payerId &&
              debt.settled !== debt.amount
          )
        : true
    );

  const settledExpenses = expenses
    .filter((expense) =>
      expense.debts.every((debt) => debt.settled === debt.amount)
    )
    .filter((expense) =>
      onlyUserDebts
        ? expense.debts.some(
            (debt) =>
              debt.debtorId === user.id &&
              debt.debtorId !== debt.expense.payerId
          )
        : true
    );

  return (
    <Stack>
      <Checkbox
        label="Moje długi"
        checked={onlyUserDebts}
        onChange={() => toggleOnlyUserDebts()}
      />
      <Accordion variant="contained">
        {unsettledExpenses.length ? (
          unsettledExpenses.map((expense) => (
            <ExpenseCard key={expense.id} group={group} expense={expense} />
          ))
        ) : (
          <Paper withBorder p="md">
            <Text>{`Nie ${onlyUserDebts ? "masz" : "ma"} żadnych długów`}</Text>
          </Paper>
        )}
      </Accordion>
      <Divider label="Historia" labelPosition="center" />
      <Accordion variant="contained">
        {settledExpenses.map((expense) => (
          <ExpenseCard key={expense.id} group={group} expense={expense} />
        ))}
      </Accordion>
    </Stack>
  );
}

export default ExpenseList;
