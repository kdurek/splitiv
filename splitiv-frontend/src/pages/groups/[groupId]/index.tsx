import { HStack, Heading, IconButton, Skeleton, Stack } from "@chakra-ui/react";
import { IconChevronLeft, IconSettings } from "@tabler/icons";
import { useNavigate, useParams } from "react-router";

import CreateExpenseModal from "../../../components/expense/CreateExpenseModal/CreateExpenseModal";
import ExpenseList from "../../../components/expense/ExpenseList/ExpenseList";
import CreatePaymentModal from "../../../components/group/CreatePaymentModal";
import UserBalance from "../../../components/group/UserBalance";
import { useGroup } from "../../../hooks/useGroup";
import { useGroupExpenses } from "../../../hooks/useGroupExpenses";

function Group() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { data: group, isSuccess: isSuccessGroup } = useGroup(groupId);
  const { data: expenses, isSuccess: isSuccessGroupExpenses } =
    useGroupExpenses(groupId);

  return (
    <Skeleton isLoaded={isSuccessGroup && isSuccessGroupExpenses}>
      {group && (
        <Stack spacing={4}>
          <HStack justify="space-between">
            <HStack>
              <IconButton
                variant="ghost"
                aria-label="Cofnij do grupy"
                icon={<IconChevronLeft />}
                onClick={() => navigate("/groups")}
              />
              <Heading>{group.name}</Heading>
            </HStack>
            <IconButton
              variant="ghost"
              aria-label="Group settings"
              icon={<IconSettings />}
              onClick={() => navigate(`/groups/${group.id}/settings`)}
            />
          </HStack>
          <UserBalance members={group.members} debts={group.debts} />
          <CreateExpenseModal groupId={groupId} members={group.members} />
          <CreatePaymentModal
            groupId={groupId}
            members={group.members}
            debts={group.debts}
          />
        </Stack>
      )}
      {group && expenses && (
        <ExpenseList
          groupId={groupId}
          expenses={expenses}
          members={group.members}
        />
      )}
    </Skeleton>
  );
}

export default Group;
