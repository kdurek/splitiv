import { Button, Divider, Stack } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { signOut } from "next-auth/react";

import { GroupSelect, GroupSettingsMembers } from "features/group";
import { Section } from "features/layout";

function SettingsPage() {
  return (
    <Section title="Ustawienia">
      <Stack>
        <GroupSelect />
        <GroupSettingsMembers />
        <Divider />
        <Button
          variant="default"
          leftIcon={<IconLogout />}
          onClick={() => signOut()}
        >
          Wyloguj
        </Button>
      </Stack>
    </Section>
  );
}

export default SettingsPage;
