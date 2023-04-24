import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { useActiveGroup } from "features/group";

import { ExpenseForm } from "./expense-form";

export function CreateExpenseModal() {
  const [opened, { open, close }] = useDisclosure(false);
  const activeGroup = useActiveGroup();

  const singleDefaults = {
    ower: "",
  };

  const equalDefaults = activeGroup.members.map((member) => ({
    id: member.id,
    name: member.name as string,
    check: false,
  }));

  const unequalDefaults = activeGroup.members.map((member) => ({
    id: member.id,
    name: member.name as string,
    amount: 0,
  }));

  const ratioDefaults = activeGroup.members.map((member) => ({
    id: member.id,
    name: member.name as string,
    ratio: 0,
  }));

  const defaultValues = {
    name: "",
    amount: 0,
    method: "single",
    payer: "",
    single: singleDefaults,
    equal: equalDefaults,
    unequal: unequalDefaults,
    ratio: ratioDefaults,
  };

  return (
    <>
      <Button variant="default" onClick={open}>
        Dodaj wydatek
      </Button>

      <Modal opened={opened} onClose={close} title="Dodawanie wydatku">
        <ExpenseForm
          group={activeGroup}
          defaultValues={defaultValues}
          onSuccess={close}
        />
      </Modal>
    </>
  );
}
