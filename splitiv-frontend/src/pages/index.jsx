import { useAuth0 } from "@auth0/auth0-react";
import { Button, Heading, VStack } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router";

function Index() {
  const { user } = useAuth0();
  const navigate = useNavigate();

  return (
    <VStack>
      <Heading>Witaj {user.name}</Heading>
      <Button onClick={() => navigate("/groups")}>Przeglądaj grupy</Button>
    </VStack>
  );
}

export default Index;
