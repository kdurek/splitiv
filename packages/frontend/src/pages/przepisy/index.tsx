import { Button, Divider, Stack, TextInput } from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons";
import { Link } from "react-router-dom";

import RecipeList from "components/RecipeList";

function Recipes() {
  const [search, setSearch] = useDebouncedState("", 200);

  return (
    <Stack>
      <Button variant="default" component={Link} to="/przepisy/dodaj">
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
