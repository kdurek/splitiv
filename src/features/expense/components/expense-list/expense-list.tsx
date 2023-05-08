import { Box, Paper, Stack, Text } from "@mantine/core";
import { useIntersection } from "@mantine/hooks";
import { useEffect } from "react";

import { useActiveGroup } from "features/group";
import { api } from "utils/api";

import { ExpenseCard } from "./expense-card";

interface ExpenseListProps {
  name?: string;
  description?: string;
  payerId?: string;
  debtorId?: string;
  settled?: boolean;
}

export function ExpenseList({
  name,
  description,
  payerId,
  debtorId,
  settled,
}: ExpenseListProps) {
  const activeGroup = useActiveGroup();
  const { ref, entry } = useIntersection();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading: isLoadingExpenses,
    isError: isErrorExpenses,
  } = api.expense.getInfinite.useInfiniteQuery(
    {
      limit: 10,
      groupId: activeGroup.id,
      name,
      description,
      payerId,
      debtorId,
      settled,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

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
            <ExpenseCard key={expense.id} expense={expense} />
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
