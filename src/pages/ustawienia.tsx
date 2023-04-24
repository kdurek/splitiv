import { Stack, Title } from "@mantine/core";

import { ProtectedContent } from "features/auth";
import { GroupSelect, GroupSettingsMembers } from "features/group";

function SettingsPage() {
  return (
    <Stack>
      <Title order={1}>Ustawienia</Title>
      <ProtectedContent>
        <Stack>
          <GroupSelect />
          <GroupSettingsMembers />
        </Stack>
      </ProtectedContent>
    </Stack>
  );
}

export default SettingsPage;
