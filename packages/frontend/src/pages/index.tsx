import { Stack, Title } from "@mantine/core";

import { MainLinks } from "components/Layout/MainLinks";
import { useAuth } from "providers/AuthProvider";

function HomePage() {
  const { user } = useAuth();

  return (
    <Stack>
      <Title align="center">{`Witaj ${user?.name || ""}`}</Title>
      <MainLinks />
    </Stack>
  );
}

export default HomePage;
