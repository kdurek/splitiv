import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { GetExpensesByGroup } from "utils/trpc";

import UpdateExpenseForm from "./UpdateExpenseForm";

interface UpdateExpenseModalProps {
  expense: GetExpensesByGroup[number];
}

function UpdateExpenseModal({ expense }: UpdateExpenseModalProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button variant="default" onClick={open}>
        Edytuj płatność
      </Button>

      <Modal opened={opened} onClose={close} title="Edytowanie wydatku">
        <UpdateExpenseForm expense={expense} afterSubmit={close} />
      </Modal>
    </>
  );
}

export default UpdateExpenseModal;
