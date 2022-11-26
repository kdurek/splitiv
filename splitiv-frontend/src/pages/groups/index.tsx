import { Button, HStack, Heading, Skeleton, Stack } from "@chakra-ui/react";
import { useNavigate } from "react-router";

import CreateGroupModal from "../../components/group/CreateGroupModal";
import { useGroups } from "../../hooks/useGroups";

function Groups() {
  const navigate = useNavigate();
  const { data: groups, isSuccess: isSuccessGroups } = useGroups();

  return (
    <Skeleton isLoaded={isSuccessGroups}>
      {groups && (
        <Stack spacing={4}>
          <HStack justify="space-between">
            <Heading>Moje grupy</Heading>
            <CreateGroupModal />
          </HStack>
          <Stack>
            {groups.map((group) => (
              <Button
                key={group.id}
                variant="outline"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                {group.name}
              </Button>
            ))}
          </Stack>
        </Stack>
      )}
    </Skeleton>
  );
}

export default Groups;
