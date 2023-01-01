import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { useGroup } from "hooks/useGroup";

import CreatePaymentForm from "./CreatePaymentForm";

interface CreatePaymentModalProps {
  groupId: string;
}

function CreatePaymentModal({ groupId }: CreatePaymentModalProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const { data: group } = useGroup(groupId);

  return (
    <>
      <Button variant="default" onClick={open}>
        Dodaj płatność
      </Button>

      {group && (
        <Modal opened={opened} onClose={close} title="Dodawanie płatności">
          <CreatePaymentForm group={group} afterSubmit={close} />
        </Modal>
      )}
    </>
  );
}

export default CreatePaymentModal;
