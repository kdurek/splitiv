import { Button, Modal, NativeSelect, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useSession } from "next-auth/react";
import { useState } from "react";

import { useCurrentUserUnsettledDebtsByGroup } from "features/expense/api/use-current-user-unsettled-debts-by-group";
import { useActiveGroup } from "features/group";

import { ExpensePayList } from "./expense-pay-list";

export function ExpensePayListModal() {
  const [opened, { open, close }] = useDisclosure(false);
  const activeGroup = useActiveGroup();

  const { data: unsettledDebts } = useCurrentUserUnsettledDebtsByGroup();
  const { data: session } = useSession();

  const [selectedUserId, setSelectedUserId] = useState<string>();

  if (!unsettledDebts?.length || !session) return null;

  const owedGroupUsers = activeGroup.members
    .filter((member) => member.id !== session.user.id)
    .filter((member) =>
      unsettledDebts.some(
        (debtField) => debtField.expense.payerId === member.id
      )
    )
    .map((member) => ({
      value: member.id,
      label: member.name ?? "Brak nazwy",
    }));

  const selectedUserDebts = unsettledDebts.filter(
    (debt) => selectedUserId === debt.expense.payerId
  );

  const values = {
    debts: selectedUserDebts.map((debt) => {
      return {
        id: debt.id,
        name: debt.expense.name,
        settled: Number(debt.settled),
        amount: Number(debt.amount),
        check: false,
      };
    }),
  };

  return (
    <>
      <Button variant="default" onClick={open}>
        Oddaj długi
      </Button>

      <Modal opened={opened} onClose={close} title="Oddawanie długów">
        <Stack>
          <NativeSelect
            data={[
              { value: "", label: "Wybierz osobę do oddania..." },
              ...owedGroupUsers,
            ]}
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.currentTarget.value)}
            withAsterisk
          />
          {selectedUserId && (
            <ExpensePayList afterSubmit={close} values={values} />
          )}
        </Stack>
      </Modal>
    </>
  );
}
