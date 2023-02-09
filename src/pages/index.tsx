import { Stack, Title } from "@mantine/core";
import { useSession } from "next-auth/react";

import { MainLinks } from "components/Layout/MainLinks";

function HomePage() {
  const { data: session } = useSession();

  return (
    <Stack>
      <Title align="center">{`Witaj ${session?.user?.name || ""}`}</Title>
      <MainLinks />
    </Stack>
  );
}

export default HomePage;
