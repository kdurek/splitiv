import { HStack, Heading, Skeleton, Stack } from "@chakra-ui/react";

import CreateGroupModal from "components/group/CreateGroupModal";
import GroupList from "components/group/GroupList";
import { useGroups } from "hooks/useGroups";

function Groups() {
  const { data: groups, isSuccess: isSuccessGroups } = useGroups();

  return (
    <Skeleton isLoaded={isSuccessGroups}>
      {groups && (
        <Stack spacing={4}>
          <HStack justify="space-between">
            <Heading>Moje grupy</Heading>
            <CreateGroupModal />
          </HStack>
          <GroupList groups={groups} />
        </Stack>
      )}
    </Skeleton>
  );
}

export default Groups;
