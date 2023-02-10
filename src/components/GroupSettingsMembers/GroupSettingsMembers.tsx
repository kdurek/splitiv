import { List, Stack, Title } from "@mantine/core";

import { useGroup } from "hooks/useGroup";
import { useActiveGroup } from "providers/ActiveGroupProvider";

import AddUserToGroupModal from "../AddUserToGroupModal";

function GroupSettingsMembers() {
  const { activeGroupId } = useActiveGroup();
  const { data: group } = useGroup(activeGroupId);

  if (!group) return null;

  return (
    <Stack>
      <Title order={2}>Członkowie</Title>
      <List>
        {group.members.map((user) => (
          <List.Item key={user.id}>{user.name}</List.Item>
        ))}
      </List>
      <AddUserToGroupModal groupId={activeGroupId} />
    </Stack>
  );
}

export default GroupSettingsMembers;
