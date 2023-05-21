import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { GroupSelectForm } from "./group-select-form";

export function GroupSelectModal() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button variant="default" onClick={open}>
        Wybierz grupę
      </Button>

      <Modal opened={opened} onClose={close} title="Wybierz aktywną grupę">
        <GroupSelectForm onSubmit={close} />
      </Modal>
    </>
  );
}
