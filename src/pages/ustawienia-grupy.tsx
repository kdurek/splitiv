import { Stack, Title } from "@mantine/core";

import { GroupSelect, GroupSettingsMembers } from "features/group";
import ProtectedContent from "ProtectedContent";

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
