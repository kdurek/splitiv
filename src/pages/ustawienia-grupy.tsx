import { Stack, Title } from "@mantine/core";

import GroupSelect from "components/GroupSelect";
import GroupSettingsMembers from "components/GroupSettingsMembers";
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
