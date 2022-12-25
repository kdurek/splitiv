import { HStack, Heading, IconButton, Skeleton, Stack } from "@chakra-ui/react";
import { IconChevronLeft, IconSettings } from "@tabler/icons";
import { useNavigate, useParams } from "react-router";

import CreateExpenseModal from "components/expense/CreateExpenseModal/CreateExpenseModal";
import ExpenseList from "components/expense/ExpenseList/ExpenseList";
import CreatePaymentModal from "components/group/CreatePaymentModal";
import UserBalance from "components/group/UserBalance";
import { useExpenses } from "hooks/useExpenses";
import { useGroup } from "hooks/useGroup";

function Group() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { data: group, isSuccess: isSuccessGroup } = useGroup(groupId);
  const { data: expenses, isSuccess: isSuccessExpenses } = useExpenses(groupId);

  return (
    <Stack spacing={4}>
      <Skeleton isLoaded={isSuccessGroup}>
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
            <UserBalance group={group} />
            <CreateExpenseModal group={group} />
            <CreatePaymentModal group={group} />
          </Stack>
        )}
      </Skeleton>
      <Skeleton isLoaded={isSuccessGroup && isSuccessExpenses}>
        {group && expenses && (
          <ExpenseList
            groupId={groupId}
            expenses={expenses}
            members={group.members}
          />
        )}
      </Skeleton>
    </Stack>
  );
}

export default Group;
