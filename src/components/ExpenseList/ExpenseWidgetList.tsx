import { Box, Title } from "@mantine/core";
import { useSession } from "next-auth/react";

import ProtectedContent from "ProtectedContent";

import ExpenseList from "./ExpenseList";

function ExpenseWidgetList() {
  const { data: session } = useSession();

  return (
    <Box>
      <Title order={3}>Twoje najnowsze długi</Title>
      <Box mt={8}>
        <ProtectedContent>
          <ExpenseList
            filters={{ take: 3, debtorId: session?.user.id, settled: false }}
          />
        </ProtectedContent>
      </Box>
    </Box>
  );
}

export default ExpenseWidgetList;
