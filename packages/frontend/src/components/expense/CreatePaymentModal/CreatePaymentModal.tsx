import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { GetGroupById } from "utils/trpc";

import CreatePaymentForm from "./CreatePaymentForm";

interface CreatePaymentModalProps {
  group: GetGroupById;
}

function CreatePaymentModal({ group }: CreatePaymentModalProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button variant="default" onClick={open}>
        Dodaj płatność
      </Button>

      <Modal opened={opened} onClose={close} title="Dodawanie płatności">
        <CreatePaymentForm group={group} afterSubmit={close} />
      </Modal>
    </>
  );
}

export default CreatePaymentModal;
