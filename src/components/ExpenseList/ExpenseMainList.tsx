import { Checkbox, Group, Stack } from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import { useSession } from "next-auth/react";

import ExpenseList from "./ExpenseList";

function ExpenseMainList() {
  const { data: session } = useSession();
  const [onlyUserDebts, toggleOnlyUserDebts] = useToggle();
  const [onlyUnsettled, setOnlyUnsettled] = useToggle();

  return (
    <Stack>
      <Group>
        <Checkbox
          label="Moje długi"
          checked={onlyUserDebts}
          onChange={() => toggleOnlyUserDebts()}
        />
        <Checkbox
          label="Nie oddane"
          checked={onlyUnsettled}
          onChange={() => setOnlyUnsettled()}
        />
      </Group>
      <ExpenseList
        filters={{
          debtorId: onlyUserDebts ? session?.user.id : undefined,
          settled: !onlyUnsettled,
        }}
      />
    </Stack>
  );
}

export default ExpenseMainList;
