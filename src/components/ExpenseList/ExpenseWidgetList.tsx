import { Box, Title } from "@mantine/core";
import { useSession } from "next-auth/react";

import { useExpensesByGroup } from "hooks/useExpenses";
import ProtectedContent from "ProtectedContent";
import { useActiveGroup } from "providers/ActiveGroupProvider";

import ExpenseList from "./ExpenseList";

function ExpenseWidgetList() {
  const { data: session } = useSession();
  const { activeGroupId } = useActiveGroup();

  const {
    data: expenses,
    isLoading: isLoadingExpenses,
    isError: isErrorExpenses,
  } = useExpensesByGroup({
    groupId: activeGroupId,
    debtorId: session?.user.id,
    settled: false,
    take: 3,
  });

  if (isLoadingExpenses) return null;
  if (isErrorExpenses) return null;

  return (
    <Box>
      <Title order={3}>Twoje najnowsze długi</Title>
      <Box mt={8}>
        <ProtectedContent>
          <ExpenseList expenses={expenses} />
        </ProtectedContent>
      </Box>
    </Box>
  );
}

export default ExpenseWidgetList;
