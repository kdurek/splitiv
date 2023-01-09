import { useAuth0 } from "@auth0/auth0-react";
import { Button, Stack, Title } from "@mantine/core";
import { useNavigate } from "react-router";

function Index() {
  const { user } = useAuth0();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <Stack>
      <Title align="center">Witaj {user.name}</Title>
      <Button variant="default" onClick={() => navigate("/przepisy")}>
        Przeglądaj przepisy
      </Button>
      <Button variant="default" onClick={() => navigate("/wydatki")}>
        Przeglądaj wydatki
      </Button>
      <Button variant="default" onClick={() => navigate("/zadania")}>
        Przeglądaj zadania
      </Button>
    </Stack>
  );
}

export default Index;
