import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import CreateGroupForm from "./CreateGroupForm";

function CreateGroupModal() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button variant="default" onClick={open}>
        Stwórz grupę
      </Button>

      <Modal opened={opened} onClose={close} title="Tworzenie grupy">
        <CreateGroupForm afterSubmit={close} />
      </Modal>
    </>
  );
}

export default CreateGroupModal;
