import { Button, Divider, Stack, TextInput, Title } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import Link from "next/link";

import { RecipeList } from "features/recipe";

function Recipes() {
  const [search, setSearch] = useDebouncedState("", 200);

  return (
    <Stack>
      <Title order={1}>Przepisy</Title>
      <Button variant="default" component={Link} href="/przepisy/dodaj">
        Dodaj przepis
      </Button>
      <TextInput
        placeholder="Szukaj"
        defaultValue={search}
        icon={<IconSearch size={14} />}
        onChange={(event) => setSearch(event.currentTarget.value)}
      />
      <Divider />
      <RecipeList search={search} />
    </Stack>
  );
}

export default Recipes;
