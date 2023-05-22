import { ActionIcon, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPlus } from "@tabler/icons-react";

import { ExpenseForm } from "./expense-form";

export function ExpenseModal() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <ActionIcon p="lg" variant="filled" color="blue" onClick={open}>
        <IconPlus />
      </ActionIcon>

      <Modal
        opened={opened}
        fullScreen
        onClose={close}
        title="Dodawanie wydatku"
      >
        <ExpenseForm onSubmit={close} />
      </Modal>
    </>
  );
}
