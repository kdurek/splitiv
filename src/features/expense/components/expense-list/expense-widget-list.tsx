import { Box, Title } from "@mantine/core";
import { useSession } from "next-auth/react";

import ProtectedContent from "ProtectedContent";
import { useActiveGroup } from "providers/ActiveGroupProvider";

import { ExpenseList } from "./expense-list";

export function ExpenseWidgetList() {
  const { data: session } = useSession();
  const { activeGroupId } = useActiveGroup();

  return (
    <Box>
      <Title order={3}>Twoje najnowsze długi</Title>
      <Box mt={8}>
        <ProtectedContent>
          <ExpenseList
            groupId={activeGroupId}
            debtorId={session?.user.id}
            settled={false}
            take={3}
          />
        </ProtectedContent>
      </Box>
    </Box>
  );
}
