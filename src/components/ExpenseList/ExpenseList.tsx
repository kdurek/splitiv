import { Accordion, Paper, Stack, Text } from "@mantine/core";

import ExpenseCard from "./ExpenseCard";

import type { GetExpensesByGroup } from "utils/api";

interface ExpenseListProps {
  expenses: GetExpensesByGroup;
}

function ExpenseList({ expenses }: ExpenseListProps) {
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
