import {
  ActionIcon,
  AppShell,
  Burger,
  Flex,
  Footer,
  Group,
  Header,
  MediaQuery,
  Navbar,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconCash,
  IconChefHat,
  IconHome,
  IconMoon,
  IconSettings,
  IconSun,
} from "@tabler/icons-react";
import { useRouter } from "next/router";

import { Logo } from "./logo";
import { MainLinks } from "./main-links";

import type { ReactNode } from "react";

const data = [
  {
    icon: <IconHome />,
    color: "dark",
    label: "Główna",
    href: "/",
  },
  {
    icon: <IconCash />,
    color: "teal",
    label: "Wydatki",
    href: "/wydatki",
  },
  {
    icon: <IconChefHat />,
    color: "yellow",
    label: "Przepisy",
    href: "/przepisy",
  },
  {
    icon: <IconSettings />,
    color: "violet",
    label: "Ustawienia grupy",
    href: "/ustawienia-grupy",
  },
];

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [opened, { close, toggle }] = useDisclosure(false);
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const router = useRouter();

  return (
    <AppShell
      header={
        <Header height={{ base: 50, sm: 70 }} p="md">
          <Flex justify="space-between" align="center" h="100%">
            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Burger
                opened={opened}
                onClick={toggle}
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
      footer={
        <Footer display={{ sm: "none" }} height={{ base: 90 }}>
          <Group grow p="xs">
            {data.map((link) => (
              <ActionIcon
                key={link.label}
                color={link.color}
                onClick={() => router.push(link.href)}
              >
                {link.icon}
              </ActionIcon>
            ))}
          </Group>
        </Footer>
      }
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          width={{ sm: 300 }}
        >
          <Navbar.Section grow mt="xs">
            <MainLinks close={close} />
          </Navbar.Section>
        </Navbar>
      }
    >
      {children}
    </AppShell>
  );
}

export default Layout;