import { List, Stack, Title } from "@mantine/core";

import AddUserToGroupModal from "components/group/AddUserToGroupModal";
import GroupSelect from "components/GroupSelect/GroupSelect";
import { useGroup } from "hooks/useGroup";
import { useUsers } from "hooks/useUsers";
import { useActiveGroup } from "providers/ActiveGroupProvider";

function GroupSettings() {
  const { activeGroupId: groupId } = useActiveGroup();
  const { data: group } = useGroup(groupId);
  const { data: users } = useUsers();

  return (
    <Stack>
      <Title order={1}>Ustawienia grupy</Title>
      <GroupSelect />
      {group && users && (
        <Stack>
          <Title order={2}>Członkowie</Title>
          <List>
            {group.members.map((user) => (
              <List.Item key={user.id}>{user.name}</List.Item>
            ))}
          </List>
          <AddUserToGroupModal groupId={groupId} />
        </Stack>
      )}
    </Stack>
  );
}

export default GroupSettings;
