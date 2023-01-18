import { Stack, Title } from "@mantine/core";

import GroupSelect from "components/GroupSelect";
import GroupSettingsMembers from "components/GroupSettingsMembers";
import ProtectedRoute from "ProtectedRoute";

function GroupSettingsPage() {
  return (
    <ProtectedRoute>
      <Stack>
        <Title order={1}>Ustawienia grupy</Title>
        <GroupSelect />
        <GroupSettingsMembers />
      </Stack>
    </ProtectedRoute>
  );
}

export default GroupSettingsPage;
