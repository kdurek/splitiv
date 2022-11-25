import { Button, HStack, Heading, Skeleton, Stack } from "@chakra-ui/react";
import { useNavigate } from "react-router";

import CreateGroupModal from "../../components/group/CreateGroupModal";
import SkeletonWrapper from "../../components/SkeletonWrapper";
import { useGroups } from "../../hooks/useGroups";

function Groups() {
  const navigate = useNavigate();
  const { data: groups, isSuccess: isSuccessGroups } = useGroups();

  return (
    <SkeletonWrapper isLoaded={isSuccessGroups}>
      <Stack spacing={4}>
        <HStack justify="space-between">
          <Heading>Moje grupy</Heading>
          <CreateGroupModal />
        </HStack>
        <Skeleton isLoaded={isSuccessGroups}>
          <Stack>
            {groups?.map((group) => (
              <Button
                key={group.id}
                variant="outline"
                onClick={() => navigate(`/groups/${group.id}`)}
              >
                {group.name}
              </Button>
            ))}
          </Stack>
        </Skeleton>
      </Stack>
    </SkeletonWrapper>
  );
}

export default Groups;
