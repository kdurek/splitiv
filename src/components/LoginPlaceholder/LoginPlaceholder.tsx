import { Button, Center, Stack, Title } from "@mantine/core";
import { IconLogin } from "@tabler/icons-react";
import { signIn } from "next-auth/react";

function LoginPlaceholder() {
  return (
    <Center component={Stack} w="100%" h="100%">
      <Title maw={400} align="center">
        Musisz się zalogować aby przejść dalej
      </Title>
      <Button
        variant="default"
        leftIcon={<IconLogin />}
        onClick={() => signIn("google")}
      >
        Zaloguj
      </Button>
    </Center>
  );
}

export default LoginPlaceholder;
