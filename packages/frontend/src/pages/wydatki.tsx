import { HStack, Heading, IconButton, Skeleton, Stack } from "@chakra-ui/react";
import { IconSettings } from "@tabler/icons";
import { useNavigate } from "react-router";

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
  const navigate = useNavigate();

  return (
    <Stack spacing={4}>
      <Heading>Wydatki</Heading>
      <HStack justify="space-between">
        <GroupSelect />
        <IconButton
          variant="outline"
          size="lg"
          aria-label="Group settings"
          icon={<IconSettings />}
          onClick={() => navigate("/ustawienia-grupy")}
        />
      </HStack>
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
