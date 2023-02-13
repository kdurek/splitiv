import { Accordion, Paper, Stack, Text } from "@mantine/core";

import { useExpensesByGroup } from "hooks/useExpenses";

import ExpenseCard from "./ExpenseCard";

interface ExpenseListProps {
  groupId: string;
  name?: string;
  description?: string;
  payerId?: string;
  debtorId?: string;
  settled?: boolean;
  take?: number;
}

function ExpenseList({
  groupId,
  name,
  description,
  payerId,
  debtorId,
  settled,
  take,
}: ExpenseListProps) {
  const {
    data: expenses,
    isLoading: isLoadingExpenses,
    isError: isErrorExpenses,
  } = useExpensesByGroup({
    groupId,
    name,
    description,
    payerId,
    debtorId,
    settled,
    take,
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
