import { Accordion, Flex, Pagination, Paper, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";

import { useExpenses } from "hooks/useExpenses";

import ExpenseCard from "./ExpenseCard";

interface ExpenseListProps {
  groupId: string;
  name?: string;
  description?: string;
  payerId?: string;
  debtorId?: string;
  settled?: boolean;
  take?: number;
  withPagination?: boolean;
}

function ExpenseList({
  groupId,
  name,
  description,
  payerId,
  debtorId,
  settled,
  take,
  withPagination,
}: ExpenseListProps) {
  const [activePage, setPage] = useState(1);
  const [activeExpenseId, setActiveExpenseId] = useState<string | null>(null);

  useEffect(() => {
    if (withPagination) {
      setPage(1);
    }
  }, [name, description, payerId, debtorId, withPagination]);

  const {
    data: expenses,
    isLoading: isLoadingExpenses,
    isError: isErrorExpenses,
  } = useExpenses({
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

  const expensesPerPage = 8;
  const indexOfLastExpense = activePage * expensesPerPage;
  const indexOfFirstExpense = indexOfLastExpense - expensesPerPage;
  const currentExpenses = expenses.slice(
    indexOfFirstExpense,
    indexOfLastExpense
  );

  const expensesToRender = withPagination ? currentExpenses : expenses;

  return (
    <Stack>
      <Accordion
        value={activeExpenseId}
        onChange={setActiveExpenseId}
        variant="contained"
      >
        {expensesToRender.length ? (
          expensesToRender.map((expense) => (
            <ExpenseCard
              key={expense.id}
              activeExpenseId={activeExpenseId}
              expense={expense}
            />
          ))
        ) : (
          <Paper withBorder p="md">
            <Text>Brak długów</Text>
          </Paper>
        )}
      </Accordion>
      {withPagination && (
        <Flex justify="center">
          <Pagination
            page={activePage}
            onChange={setPage}
            total={Math.ceil(expenses.length / expensesPerPage)}
          />
        </Flex>
      )}
    </Stack>
  );
}

export default ExpenseList;
