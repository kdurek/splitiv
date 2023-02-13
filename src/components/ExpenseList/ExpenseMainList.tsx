import { Accordion, NativeSelect, Stack, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { useState } from "react";

import { useGroup } from "hooks/useGroup";
import { useActiveGroup } from "providers/ActiveGroupProvider";

import ExpenseList from "./ExpenseList";

function ExpenseMainList() {
  const { activeGroupId } = useActiveGroup();
  const {
    data: group,
    isLoading: isLoadingGroup,
    isError: isErrorGroup,
  } = useGroup(activeGroupId);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch] = useDebouncedValue(search, 500);
  const [payer, setPayer] = useState<string>("");
  const [debtor, setDebtor] = useState<string>("");

  if (isLoadingGroup) return null;
  if (isErrorGroup) return null;

  const groupUsersToSelect = [
    { value: "", label: "Wszyscy" },
    ...group.members.map((user) => ({
      value: user.id,
      label: user.name ?? "Brak nazwy",
    })),
  ];

  return (
    <Stack>
      <Accordion variant="contained">
        <Accordion.Item value="filters">
          <Accordion.Control py="xs">Szukaj</Accordion.Control>
          <Accordion.Panel>
            <Stack spacing="xs">
              <TextInput
                placeholder="Nazwa lub opis..."
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
                icon={<IconSearch size={14} />}
              />
              <NativeSelect
                label="Zapłacone przez"
                value={payer}
                onChange={(event) => setPayer(event.currentTarget.value)}
                data={groupUsersToSelect}
              />
              <NativeSelect
                label="Pożyczone przez"
                value={debtor}
                onChange={(event) => setDebtor(event.currentTarget.value)}
                data={groupUsersToSelect}
              />
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <ExpenseList
        groupId={activeGroupId}
        name={debouncedSearch}
        description={debouncedSearch}
        payerId={payer || undefined}
        debtorId={debtor || undefined}
      />
    </Stack>
  );
}

export default ExpenseMainList;
