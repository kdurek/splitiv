import { useAuth0 } from "@auth0/auth0-react";
import { Button, Heading, Skeleton, Stack } from "@chakra-ui/react";
import { useNavigate } from "react-router";

function Index() {
  const { user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  return (
    <Skeleton isLoaded={isAuthenticated}>
      {user && (
        <Stack>
          <Heading>Witaj {user.name}</Heading>
          <Button onClick={() => navigate("/wydatki")}>
            Przeglądaj wydatki
          </Button>
          <Button onClick={() => navigate("/zadania")}>
            Przeglądaj zadania
          </Button>
        </Stack>
      )}
    </Skeleton>
  );
}

export default Index;
