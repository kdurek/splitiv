import { Stack } from "@mantine/core";

import CreateExpenseModal from "components/CreateExpenseModal";
import ExpensePayListModal from "components/ExpensePayList/ExpensePayListModal";
import { useGroup } from "hooks/useGroup";
import { useActiveGroup } from "providers/ActiveGroupProvider";

function ExpenseCreateButtons() {
  const { activeGroupId } = useActiveGroup();
  const { data: group } = useGroup(activeGroupId);

  if (!group) return null;

  return (
    <Stack>
      <CreateExpenseModal group={group} />
      <ExpensePayListModal />
    </Stack>
  );
}

export default ExpenseCreateButtons;
