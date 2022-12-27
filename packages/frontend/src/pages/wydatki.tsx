import { Divider, Heading, Skeleton, Stack } from "@chakra-ui/react";

import CreateExpenseModal from "components/expense/CreateExpenseModal";
import CreatePaymentModal from "components/expense/CreatePaymentModal";
import ExpenseList from "components/expense/ExpenseList";
import UserBalance from "components/expense/UserBalance";
import GroupSelect from "components/GroupSelect/GroupSelect";
import { useExpenses } from "hooks/useExpenses";
import { useGroup } from "hooks/useGroup";
import { useActiveGroup } from "providers/ActiveGroupProvider";

function Expenses() {
  const { activeGroupId: groupId } = useActiveGroup();
  const { data: group, isSuccess: isSuccessGroup } = useGroup(groupId);
  const { data: expenses, isSuccess: isSuccessExpenses } = useExpenses(groupId);

  return (
    <Stack spacing={4}>
      <Heading>Wydatki</Heading>
      <GroupSelect />
      <Divider />
      <Skeleton isLoaded={isSuccessGroup}>
        {group && (
          <Stack spacing={4}>
            <UserBalance group={group} />
            <CreateExpenseModal group={group} />
            <CreatePaymentModal group={group} />
          </Stack>
        )}
      </Skeleton>
      <Skeleton isLoaded={isSuccessExpenses}>
        {expenses && <ExpenseList expenses={expenses} />}
      </Skeleton>
    </Stack>
  );
}

export default Expenses;
