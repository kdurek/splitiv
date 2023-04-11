import {
  Accordion,
  Button,
  Divider,
  NativeSelect,
  Stack,
  TextInput,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { useGroup } from "hooks/useGroup";
import { useActiveGroup } from "providers/ActiveGroupProvider";

import { ExpensePaymentLegend } from "./expense-card-legend";
import { ExpenseList } from "./expense-list";

export function ExpenseMainList() {
  const { data: session } = useSession();
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

  const handleFilterParticipatedDebts = () => {
    if (session) {
      setDebtor(session.user.id);
    }
  };

  const handleFiltersReset = () => {
    setSearch("");
    setPayer("");
    setDebtor("");
  };

  return (
    <Stack>
      <ExpensePaymentLegend />
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
              <Divider label="Szybkie filtry" labelPosition="center" />
              <Button variant="default" onClick={handleFilterParticipatedDebts}>
                Wydatki w których uczestniczę
              </Button>
              <Button variant="subtle" color="red" onClick={handleFiltersReset}>
                Resetuj filtry
              </Button>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <ExpenseList
        withPagination
        groupId={activeGroupId}
        name={debouncedSearch}
        description={debouncedSearch}
        payerId={payer || undefined}
        debtorId={debtor || undefined}
      />
    </Stack>
  );
}
