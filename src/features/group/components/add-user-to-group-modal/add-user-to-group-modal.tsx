import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { useActiveGroup } from "../active-group.context";

import { AddUserToGroupForm } from "./add-user-to-group-form";

export function AddUserToGroupModal() {
  const [opened, { open, close }] = useDisclosure(false);
  const activeGroup = useActiveGroup();

  return (
    <>
      <Button variant="default" onClick={open}>
        Dodaj użytkownika
      </Button>

      <Modal opened={opened} onClose={close} title="Dodawanie użytkownika">
        <AddUserToGroupForm group={activeGroup} afterSubmit={close} />
      </Modal>
    </>
  );
}
