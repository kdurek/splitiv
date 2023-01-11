import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { useGroup } from "hooks/useGroup";

import CreateExpenseForm from "../CreateExpenseForm";

interface CreateExpenseModalProps {
  groupId: string;
}

function CreateExpenseModal({ groupId }: CreateExpenseModalProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const { data: group } = useGroup(groupId);

  return (
    <>
      <Button variant="default" onClick={open}>
        Dodaj wydatek
      </Button>

      {group && (
        <Modal opened={opened} onClose={close} title="Dodawanie wydatku">
          <CreateExpenseForm group={group} afterSubmit={close} />
        </Modal>
      )}
    </>
  );
}

export default CreateExpenseModal;
