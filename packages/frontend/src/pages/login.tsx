import { useAuth0 } from "@auth0/auth0-react";
import { Button, Center, Stack, Title } from "@mantine/core";
import { IconLogin } from "@tabler/icons-react";

function LoginPage() {
  const { loginWithRedirect } = useAuth0();

  return (
    <Center component={Stack} w="100%" h="100%">
      <Title maw={400} align="center">
        Musisz się zalogować aby przejść dalej
      </Title>
      <Button
        variant="default"
        leftIcon={<IconLogin />}
        onClick={() =>
          loginWithRedirect({
            authorizationParams: {
              connection: "google-oauth2",
            },
          })
        }
      >
        Zaloguj
      </Button>
    </Center>
  );
}

export default LoginPage;
