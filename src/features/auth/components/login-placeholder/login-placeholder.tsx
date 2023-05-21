import { Button, Center, Paper, Stack, Title } from "@mantine/core";
import { IconLogin } from "@tabler/icons-react";
import { signIn } from "next-auth/react";

export function LoginPlaceholder() {
  return (
    <Paper m="xl" withBorder p="md">
      <Center component={Stack} w="100%" h="100%">
        <Title maw={400} align="center">
          Aby przejść dalej, zaloguj się
        </Title>
        <Button
          variant="default"
          leftIcon={<IconLogin />}
          onClick={() => signIn("google")}
        >
          Zaloguj
        </Button>
      </Center>
    </Paper>
  );
}
