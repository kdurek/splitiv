import { Button, Divider, Stack, Title } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { signOut } from "next-auth/react";

import { GroupSelect, GroupSettingsMembers } from "features/group";

function SettingsPage() {
  return (
    <Stack>
      <Title order={1}>Ustawienia</Title>
      <Stack>
        <GroupSelect />
        <GroupSettingsMembers />
      </Stack>
      <Divider />
      <Button
        variant="default"
        leftIcon={<IconLogout />}
        onClick={() => signOut()}
      >
        Wyloguj
      </Button>
    </Stack>
  );
}

export default SettingsPage;
