import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { useGroup } from "hooks/useGroup";

import AddUserToGroupForm from "./AddUserToGroupForm";

interface AddUserToGroupModalProps {
  groupId: string;
}

function AddUserToGroupModal({ groupId }: AddUserToGroupModalProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const { data: group } = useGroup(groupId);

  return (
    <>
      <Button variant="default" onClick={open}>
        Dodaj użytkownika
      </Button>

      {group && (
        <Modal opened={opened} onClose={close} title="Dodawanie użytkownika">
          <AddUserToGroupForm group={group} afterSubmit={close} />
        </Modal>
      )}
    </>
  );
}

export default AddUserToGroupModal;
