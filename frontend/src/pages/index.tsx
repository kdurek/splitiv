import { useAuth0 } from "@auth0/auth0-react";
import { Button, Heading, Skeleton, VStack } from "@chakra-ui/react";
import { useNavigate } from "react-router";

function Index() {
  const { user, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  return (
    <Skeleton isLoaded={isAuthenticated}>
      {user && (
        <VStack>
          <Heading>Witaj {user.name}</Heading>
          <Button onClick={() => navigate("/groups")}>Przeglądaj grupy</Button>
        </VStack>
      )}
    </Skeleton>
  );
}

export default Index;
