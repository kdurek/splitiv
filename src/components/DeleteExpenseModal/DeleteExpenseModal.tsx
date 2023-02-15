import { Button, Group, Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { useDeleteExpense } from "hooks/useDeleteExpense";

interface DeleteExpenseModalProps {
  expenseId: string;
}

function DeleteExpenseModal({ expenseId }: DeleteExpenseModalProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const { mutate: deleteExpense, isLoading: isLoadingDeleteExpense } =
    useDeleteExpense();

  const handleExpenseDelete = () => {
    deleteExpense(
      { expenseId },
      {
        onSuccess() {
          close();
        },
      }
    );
  };

  return (
    <>
      <Button variant="light" color="red" onClick={open}>
        Usuń
      </Button>

      <Modal
        withCloseButton={false}
        opened={opened}
        onClose={close}
        title="Usuwanie wydatku"
      >
        <Text>Czy na pewno chcesz usunąć ten wydatek?</Text>
        <Group mt={24} position="right">
          <Button variant="subtle" onClick={close}>
            Nie
          </Button>
          <Button
            loading={isLoadingDeleteExpense}
            variant="light"
            color="red"
            onClick={handleExpenseDelete}
          >
            Tak
          </Button>
        </Group>
      </Modal>
    </>
  );
}

export default DeleteExpenseModal;
