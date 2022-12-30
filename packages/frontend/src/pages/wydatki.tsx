import { Stack, Title } from "@mantine/core";

import CreateExpenseModal from "components/expense/CreateExpenseModal";
import CreatePaymentModal from "components/expense/CreatePaymentModal";
import ExpenseList from "components/expense/ExpenseList";
import UserBalance from "components/expense/UserBalance";
import GroupSelect from "components/GroupSelect/GroupSelect";
import { useGroup } from "hooks/useGroup";
import { useActiveGroup } from "providers/ActiveGroupProvider";

function Expenses() {
  const { activeGroupId: groupId } = useActiveGroup();
  const { data: group } = useGroup(groupId);

  if (!group) return null;

  return (
    <Stack>
      <Title order={1}>Wydatki</Title>
      <GroupSelect />
      <UserBalance />
      <CreateExpenseModal group={group} />
      <CreatePaymentModal group={group} />
      <ExpenseList />
    </Stack>
  );
}

export default Expenses;
