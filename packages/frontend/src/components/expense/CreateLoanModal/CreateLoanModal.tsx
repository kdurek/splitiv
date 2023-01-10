import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { useGroup } from "hooks/useGroup";

import CreateLoanForm from "./CreateLoanForm";

interface CreatePaymentModalProps {
  groupId: string;
}

function CreateLoanModal({ groupId }: CreatePaymentModalProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const { data: group } = useGroup(groupId);

  return (
    <>
      <Button variant="default" onClick={open}>
        Dodaj pożyczkę
      </Button>

      {group && (
        <Modal opened={opened} onClose={close} title="Dodawanie pożyczki">
          <CreateLoanForm group={group} afterSubmit={close} />
        </Modal>
      )}
    </>
  );
}

export default CreateLoanModal;
