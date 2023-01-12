import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { GetGroupById } from "utils/trpc";

import CreateLoanForm from "./CreateLoanForm";

interface CreatePaymentModalProps {
  group: GetGroupById;
}

function CreateLoanModal({ group }: CreatePaymentModalProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button variant="default" onClick={open}>
        Dodaj pożyczkę
      </Button>

      <Modal opened={opened} onClose={close} title="Dodawanie pożyczki">
        <CreateLoanForm group={group} afterSubmit={close} />
      </Modal>
    </>
  );
}

export default CreateLoanModal;
