import { Stack, Title } from "@mantine/core";

import { ProtectedContent } from "features/auth";
import { GroupSelect, GroupSettingsMembers } from "features/group";

function GroupSettingsPage() {
  return (
    <ProtectedContent>
      <Stack>
        <Title order={1}>Ustawienia grupy</Title>
        <GroupSelect />
        <GroupSettingsMembers />
      </Stack>
    </ProtectedContent>
  );
}

export default GroupSettingsPage;
