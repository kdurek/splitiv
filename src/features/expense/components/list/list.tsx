import { Box, Paper, Stack, Text } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import { useEffect } from "react";

import { useInfiniteExpenses } from "features/expense/api/use-infinite-expenses";

import { ExpenseListItem } from "./item";

import type { ExpenseFilters } from "./filters";

interface ExpenseListProps {
  filters: ExpenseFilters;
}

export function ExpenseList({
  filters: { searchText, payerId, debtorId, isSettled },
}: ExpenseListProps) {
  const { ref, entry } = useIntersection();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingExpenses,
    isError: isErrorExpenses,
  } = useInfiniteExpenses({
    searchText,
    payerId,
    debtorId,
    isSettled,
  });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, hasNextPage, fetchNextPage]);

  if (isLoadingExpenses) return null;
  if (isErrorExpenses) return null;

  const expenses = data?.pages.flatMap((page) => page.items);

  return (
    <Box>
      <Stack spacing="xs">
        {expenses.length ? (
          expenses.map((expense) => (
            <ExpenseListItem key={expense.id} expense={expense} />
          ))
        ) : (
          <Paper withBorder p="md">
            <Text>Brak długów</Text>
          </Paper>
        )}
      </Stack>
      <Box ref={ref} />
    </Box>
  );
}
