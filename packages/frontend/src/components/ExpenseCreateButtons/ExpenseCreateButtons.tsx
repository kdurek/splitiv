import { Stack } from "@mantine/core";

import CreateExpenseModal from "components/CreateExpenseModal";
import { useGroup } from "hooks/useGroup";
import { useActiveGroup } from "providers/ActiveGroupProvider";

function ExpenseCreateButtons() {
  const { activeGroupId: groupId } = useActiveGroup();
  const { data: group } = useGroup(groupId);

  if (!group) return null;

  return (
    <Stack>
      <CreateExpenseModal group={group} />
    </Stack>
  );
}

export default ExpenseCreateButtons;