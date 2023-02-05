import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { useCurrentUserUnsettledDebtsByGroup } from "hooks/useCurrentUserUnsettledDebtsByGroup";
import { useActiveGroup } from "providers/ActiveGroupProvider";

import ExpensePayList from "./ExpensePayList";

function ExpensePayListModal() {
  const [opened, { open, close }] = useDisclosure(false);
  const { activeGroupId } = useActiveGroup();
  const { data: unsettledDebts } = useCurrentUserUnsettledDebtsByGroup({
    groupId: activeGroupId,
  });

  if (!unsettledDebts?.length) return null;

  const defaultValues = {
    debts: unsettledDebts.map((debt) => {
      return {
        id: debt.id,
        name: debt.expense.name,
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
        <ExpensePayList afterSubmit={close} defaultValues={defaultValues} />
      </Modal>
    </>
  );
}

export default ExpensePayListModal;
