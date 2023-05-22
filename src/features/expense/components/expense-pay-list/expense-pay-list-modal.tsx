import { Button, Modal, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";

import { ExpensePayListForm } from "./expense-pay-list";

interface ExpensePayListModalProps {
  payerId: string;
  debtorId: string;
}

export function ExpensePayListModal({
  payerId,
  debtorId,
}: ExpensePayListModalProps) {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Button variant="default" onClick={open}>
        Oddaj długi
      </Button>

      <Modal opened={opened} onClose={close} title="Oddawanie długów">
        <Stack>
          <ExpensePayListForm
            payerId={payerId}
            debtorId={debtorId}
            onSubmit={close}
          />
        </Stack>
      </Modal>
    </>
  );
}
