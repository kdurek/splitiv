import { HStack, Heading, IconButton, Skeleton, Stack } from "@chakra-ui/react";
import { IconChevronLeft } from "@tabler/icons";
import { useNavigate, useParams } from "react-router";

import AddUserToGroupModal from "components/group/AddUserToGroupModal";
import { useGroup } from "hooks/useGroup";
import { useUsers } from "hooks/useUsers";

function GroupSettings() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { data: group, isSuccess: isSuccessGroup } = useGroup(groupId);
  const { data: users, isSuccess: isSuccessUsers } = useUsers();

  return (
    <Skeleton isLoaded={isSuccessGroup && isSuccessUsers}>
      {group && users && (
        <Stack spacing={4}>
          <HStack justify="space-between">
            <HStack>
              <IconButton
                variant="ghost"
                aria-label="Cofnij do grupy"
                icon={<IconChevronLeft />}
                onClick={() => navigate(`/groups/${group.id}`)}
              />
              <Heading>Ustawienia grupy</Heading>
            </HStack>
          </HStack>
          <AddUserToGroupModal
            groupId={groupId}
            members={group.members}
            users={users}
          />
        </Stack>
      )}
    </Skeleton>
  );
}

export default GroupSettings;
