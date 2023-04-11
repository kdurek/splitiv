import {
  Box,
  Button,
  Group,
  Text,
  ThemeIcon,
  UnstyledButton,
  useMantineTheme,
} from "@mantine/core";
import {
  IconCash,
  IconChefHat,
  IconListCheck,
  IconLogin,
  IconLogout,
  IconSettings,
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/react";

import type { ReactNode } from "react";

interface MainLinkProps {
  close?: () => void;
  icon: ReactNode;
  color: string;
  label: string;
  href: string;
}

const data = [
  {
    icon: <IconChefHat size={16} />,
    color: "yellow",
    label: "Przepisy",
    href: "/przepisy",
  },
  {
    icon: <IconCash size={16} />,
    color: "teal",
    label: "Wydatki",
    href: "/wydatki",
  },
  {
    icon: <IconListCheck size={16} />,
    color: "blue",
    label: "Zadania",
    href: "/zadania",
  },
  {
    icon: <IconSettings size={16} />,
    color: "violet",
    label: "Ustawienia grupy",
    href: "/ustawienia-grupy",
  },
];

export function MainLink({ close, icon, color, label, href }: MainLinkProps) {
  const theme = useMantineTheme();
  const router = useRouter();

  const handleNavigate = () => {
    if (close) {
      close();
    }
    router.push(href);
  };

  return (
    <UnstyledButton
      onClick={handleNavigate}
      sx={{
        display: "block",
        width: "100%",
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color:
          theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

        "&:hover": {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[6]
              : theme.colors.gray[0],
        },
      }}
    >
      <Group>
        <ThemeIcon
          color={color}
          variant={theme.colorScheme === "light" ? "light" : "filled"}
        >
          {icon}
        </ThemeIcon>

        <Text size="sm">{label}</Text>
      </Group>
    </UnstyledButton>
  );
}

interface MainLinksProps {
  close?: () => void;
}

export function MainLinks({ close }: MainLinksProps) {
  const links = data.map((link) => (
    <MainLink close={close} {...link} key={link.label} />
  ));

  const { status } = useSession();

  return (
    <Box>
      {links}
      {status === "authenticated" ? (
        <Button
          mt={10}
          variant="default"
          w="100%"
          leftIcon={<IconLogout />}
          onClick={() => signOut()}
        >
          Wyloguj
        </Button>
      ) : (
        <Button
          mt={10}
          variant="default"
          w="100%"
          leftIcon={<IconLogin />}
          onClick={() => signIn("google")}
        >
          Zaloguj
        </Button>
      )}
    </Box>
  );
}
