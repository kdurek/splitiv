"use client";

import { Box, Paper, Stack, Text } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import { useEffect } from "react";

import { useInfiniteExpenses } from "hooks/use-infinite-expenses";

import { ExpenseListItem } from "./item";

export function ExpenseList() {
  const { ref, entry } = useIntersection();

  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading: isLoadingExpenses,
    isError: isErrorExpenses,
  } = useInfiniteExpenses({});

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
