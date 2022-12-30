import {
  ActionIcon,
  AppShell,
  Burger,
  Flex,
  Header,
  MediaQuery,
  Navbar,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { IconMoon, IconSun } from "@tabler/icons";
import { ReactNode, useState } from "react";

import { Logo } from "./Logo";
import { MainLinks } from "./MainLinks";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <AppShell
      styles={{
        main: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      }}
      header={
        <Header height={{ base: 50, sm: 70 }} p="md">
          <Flex justify="space-between" align="center" h="100%">
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
              />
            </MediaQuery>
            <Flex gap={16} direction={{ sm: "row-reverse" }}>
              <Logo />
              <ActionIcon color="gray.6" onClick={() => toggleColorScheme()}>
                {colorScheme === "dark" ? <IconMoon /> : <IconSun />}
              </ActionIcon>
            </Flex>
          </Flex>
        </Header>
      }
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 300 }}
        >
          <Navbar.Section grow mt="xs">
            <MainLinks setOpened={setOpened} />
          </Navbar.Section>
        </Navbar>
      }
    >
      {children}
    </AppShell>
  );
}

export default Layout;
