import {
  ActionIcon,
  AppShell,
  Flex,
  Footer,
  Group,
  Header,
  useMantineColorScheme,
} from "@mantine/core";
import { IconCash, IconMoon, IconSettings, IconSun } from "@tabler/icons-react";
import { useRouter } from "next/navigation";

import { ExpenseModal } from "features/expense";

import { Logo } from "./logo";

import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const router = useRouter();

  return (
    <AppShell
      header={
        <Header height={{ base: 50, sm: 70 }} p="md">
          <Flex h="100%" align="center" justify="space-between">
            <Logo />
            <ActionIcon color="gray.6" onClick={() => toggleColorScheme()}>
              {colorScheme === "dark" ? <IconMoon /> : <IconSun />}
            </ActionIcon>
          </Flex>
        </Header>
      }
      footer={
        <Footer height={{ base: 90 }}>
          <Group mx="auto" maw={400} grow p="xs">
            <ActionIcon
              p="lg"
              variant="light"
              color="gray"
              onClick={() => router.push("/")}
            >
              <IconCash />
            </ActionIcon>
            <ExpenseModal />
            <ActionIcon
              p="lg"
              variant="light"
              color="gray"
              onClick={() => router.push("/ustawienia")}
            >
              <IconSettings />
            </ActionIcon>
          </Group>
        </Footer>
      }
    >
      {children}
    </AppShell>
  );
}
