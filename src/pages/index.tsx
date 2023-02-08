import { Stack, Title } from "@mantine/core";

import { MainLinks } from "components/Layout/MainLinks";
import { useCurrentUser } from "hooks/useCurrentUser";

function HomePage() {
  const { data: user } = useCurrentUser();

  return (
    <Stack>
      <Title align="center">{`Witaj ${user?.name || ""}`}</Title>
      <MainLinks />
    </Stack>
  );
}

export default HomePage;
