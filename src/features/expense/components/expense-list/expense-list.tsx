import { Flex, Pagination, Paper, Stack, Text } from "@mantine/core";
import { useEffect, useState } from "react";

import { useExpenses } from "features/expense/api/use-expenses";
import { useActiveGroup } from "features/group";

import { ExpenseCard } from "./expense-card";

interface ExpenseListProps {
  name?: string;
  description?: string;
  payerId?: string;
  debtorId?: string;
  settled?: boolean;
  take?: number;
  withPagination?: boolean;
}

export function ExpenseList({
  name,
  description,
  payerId,
  debtorId,
  settled,
  take,
  withPagination,
}: ExpenseListProps) {
  const [activePage, setPage] = useState(1);
  const activeGroup = useActiveGroup();

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
    groupId: activeGroup.id,
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
      <Stack spacing="xs">
        {expensesToRender.length ? (
          expensesToRender.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))
        ) : (
          <Paper withBorder p="md">
            <Text>Brak długów</Text>
          </Paper>
        )}
      </Stack>
      {withPagination && (
        <Flex justify="center">
          <Pagination
            value={activePage}
            onChange={setPage}
            total={Math.ceil(expenses.length / expensesPerPage)}
          />
        </Flex>
      )}
    </Stack>
  );
}
