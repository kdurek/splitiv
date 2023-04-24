import { Box, Stack, Title } from "@mantine/core";
import { useSession } from "next-auth/react";

import { ProtectedContent } from "features/auth";

import { ExpenseList } from "./expense-list";

export function ExpenseWidgetList() {
  const { data: session } = useSession();

  return (
    <Box>
      <ProtectedContent>
        <Stack>
          <Title order={3}>Twoje najnowsze długi</Title>
          <ExpenseList debtorId={session?.user.id} settled={false} take={3} />
        </Stack>
      </ProtectedContent>
    </Box>
  );
}
