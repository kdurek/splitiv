import { HStack, Heading, IconButton, Stack } from "@chakra-ui/react";
import { IconChevronLeft } from "@tabler/icons";
import { useNavigate, useParams } from "react-router";

import AddUserToGroupModal from "../../../components/group/AddUserToGroupModal";
import SkeletonWrapper from "../../../components/SkeletonWrapper";
import { useGroup } from "../../../hooks/useGroup";
import { useUsers } from "../../../hooks/useUsers";

function GroupSettings() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { data: group, isSuccess: isSuccessGroup } = useGroup(groupId);
  const { data: users, isSuccess: isSuccessUsers } = useUsers();
  // const { mutateAsync: deleteGroup } = useDeleteGroup();

  // const handleDeleteGroup = async () => {
  //   await deleteGroup(group?.id);
  //   return navigate("/groups");
  // };

  return (
    <SkeletonWrapper isLoaded={isSuccessGroup && isSuccessUsers}>
      {group && users && (
        <Stack spacing={4}>
          <HStack justify="space-between">
            <HStack>
              <IconButton
                variant="ghost"
                aria-label="Cofnij do grupy"
                icon={<IconChevronLeft />}
                onClick={() => navigate(`/groups/${group?.id}`)}
              />
              <Heading>Ustawienia grupy</Heading>
            </HStack>
          </HStack>
          <AddUserToGroupModal
            groupId={groupId}
            members={group.members}
            users={users}
          />
          {/* <ConfirmDialog */}
          {/*  title="Usuń grupę" */}
          {/*  variant="ghost" */}
          {/*  colorScheme="red" */}
          {/*  onClick={handleDeleteGroup} */}
          {/* > */}
          {/*  Usuń grupę */}
          {/* </ConfirmDialog> */}
        </Stack>
      )}
    </SkeletonWrapper>
  );
}

export default GroupSettings;
