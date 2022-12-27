import {
  Divider,
  Heading,
  ListItem,
  Skeleton,
  Stack,
  UnorderedList,
} from "@chakra-ui/react";

import AddUserToGroupModal from "components/group/AddUserToGroupModal";
import GroupSelect from "components/GroupSelect/GroupSelect";
import { useGroup } from "hooks/useGroup";
import { useUsers } from "hooks/useUsers";
import { useActiveGroup } from "providers/ActiveGroupProvider";

function GroupSettings() {
  const { activeGroupId: groupId } = useActiveGroup();
  const { data: group, isSuccess: isSuccessGroup } = useGroup(groupId);
  const { data: users, isSuccess: isSuccessUsers } = useUsers();

  return (
    <Stack spacing={4}>
      <Heading>Ustawienia grupy</Heading>
      <GroupSelect />
      <Divider />
      <Skeleton isLoaded={isSuccessGroup && isSuccessUsers}>
        {group && users && (
          <Stack spacing={2}>
            <Heading as="h3" size="lg">
              Członkowie
            </Heading>
            <UnorderedList stylePosition="inside">
              {group.members.map((user) => (
                <ListItem key={user.id}>{user.name}</ListItem>
              ))}
            </UnorderedList>
            <AddUserToGroupModal
              groupId={groupId}
              members={group.members}
              users={users}
            />
          </Stack>
        )}
      </Skeleton>
    </Stack>
  );
}

export default GroupSettings;
