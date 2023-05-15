import { List, Stack, Title } from "@mantine/core";

import { useActiveGroup } from "features/group/active-group.context";

import { AddUserToGroupModal } from "../add-user-to-group-modal";

export function GroupSettingsMembers() {
  const activeGroup = useActiveGroup();

  return (
    <Stack>
      <Title order={2}>Członkowie</Title>
      <List>
        {activeGroup.members.map((user) => (
          <List.Item key={user.id}>{user.name}</List.Item>
        ))}
      </List>
      <AddUserToGroupModal />
    </Stack>
  );
}
