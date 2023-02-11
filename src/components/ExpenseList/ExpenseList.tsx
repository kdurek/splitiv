import { Accordion, Checkbox, Group, Paper, Stack, Text } from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import { useSession } from "next-auth/react";

import { useExpensesByGroup } from "hooks/useExpenses";
import { useGroup } from "hooks/useGroup";
import { useActiveGroup } from "providers/ActiveGroupProvider";

import ExpenseCard from "./ExpenseCard";

function ExpenseList() {
  const { data: session } = useSession();
  const [onlyUserDebts, toggleOnlyUserDebts] = useToggle();
  const [onlyUnsettled, setOnlyUnsettled] = useToggle();
  const { activeGroupId } = useActiveGroup();
  const { data: group } = useGroup(activeGroupId);
  const { data: expenses } = useExpensesByGroup({
    groupId: activeGroupId,
    debtorId: onlyUserDebts ? session?.user.id : undefined,
    settled: onlyUnsettled ? false : undefined,
  });

  if (!session || !group || !expenses) return null;

  return (
    <Stack>
      <Group>
        <Checkbox
          label="Moje długi"
          checked={onlyUserDebts}
          onChange={() => toggleOnlyUserDebts()}
        />
        <Checkbox
          label="Nie oddane"
          checked={onlyUnsettled}
          onChange={() => setOnlyUnsettled()}
        />
      </Group>
      <Accordion variant="contained">
        {expenses.length ? (
          expenses.map((expense) => (
            <ExpenseCard key={expense.id} group={group} expense={expense} />
          ))
        ) : (
          <Paper withBorder p="md">
            <Text>{`Nie ${onlyUserDebts ? "masz" : "ma"} żadnych długów`}</Text>
          </Paper>
        )}
      </Accordion>
    </Stack>
  );
}

export default ExpenseList;
