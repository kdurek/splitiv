import { Accordion, Paper, Stack, Text } from "@mantine/core";

import { useExpensesByGroup } from "hooks/useExpenses";
import { useActiveGroup } from "providers/ActiveGroupProvider";

import ExpenseCard from "./ExpenseCard";

interface ExpenseListProps {
  filters: {
    groupId?: string;
    debtorId?: string;
    settled?: boolean;
    take?: number;
  };
}

function ExpenseList({ filters }: ExpenseListProps) {
  const { activeGroupId } = useActiveGroup();

  const {
    data: expenses,
    isLoading: isLoadingExpenses,
    isError: isErrorExpenses,
  } = useExpensesByGroup({
    groupId: filters?.groupId ?? activeGroupId,
    debtorId: filters?.debtorId,
    settled: filters?.settled,
    take: filters?.take,
  });

  if (isLoadingExpenses) return null;
  if (isErrorExpenses) return null;

  return (
    <Stack>
      <Accordion variant="contained">
        {expenses.length ? (
          expenses.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))
        ) : (
          <Paper withBorder p="md">
            <Text>Brak długów</Text>
          </Paper>
        )}
      </Accordion>
    </Stack>
  );
}

export default ExpenseList;
