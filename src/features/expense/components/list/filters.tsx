import {
  Accordion,
  Button,
  NativeSelect,
  Stack,
  TextInput,
} from "@mantine/core";
import { useDebouncedState } from "@mantine/hooks";
import { IconSearch } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import { useActiveGroup } from "features/group";

import type { Dispatch, SetStateAction } from "react";

export interface ExpenseFilters {
  searchText?: string;
  payerId?: string;
  debtorId?: string;
  isSettled?: boolean;
}
interface ExpenseListFiltersProps {
  setFilters: Dispatch<SetStateAction<ExpenseFilters>>;
}

export function ExpenseListFilters({ setFilters }: ExpenseListFiltersProps) {
  const activeGroup = useActiveGroup();

  const [searchText, setSearchText] = useDebouncedState<string>("", 500);
  const [payerId, setPayerId] = useState<string>("");
  const [debtorId, setDebtorId] = useState<string>("");

  const groupUsersToSelect = [
    { value: "", label: "Wszyscy" },
    ...activeGroup.members.map((user) => ({
      value: user.id,
      label: user.name ?? "Brak nazwy",
    })),
  ];

  useEffect(() => {
    setFilters({
      searchText,
      payerId,
      debtorId,
    });
  }, [searchText, debtorId, payerId, setFilters]);

  const handleFiltersReset = () => {
    setSearchText("");
    setPayerId("");
    setDebtorId("");
  };

  return (
    <Accordion variant="contained">
      <Accordion.Item value="filters">
        <Accordion.Control h={60} pl={0}>
          <TextInput
            placeholder="Nazwa lub opis..."
            defaultValue={searchText}
            variant="unstyled"
            size="xl"
            onChange={(event) => setSearchText(event.currentTarget.value)}
            icon={<IconSearch size={20} />}
          />
        </Accordion.Control>
        <Accordion.Panel>
          <Stack spacing="xs">
            <NativeSelect
              label="Zapłacone przez"
              defaultValue={payerId}
              onChange={(event) => setPayerId(event.currentTarget.value)}
              data={groupUsersToSelect}
            />
            <NativeSelect
              label="Pożyczone przez"
              value={debtorId}
              onChange={(event) => setDebtorId(event.currentTarget.value)}
              data={groupUsersToSelect}
            />
            <Button variant="subtle" color="red" onClick={handleFiltersReset}>
              Resetuj
            </Button>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
