import { Button, Group, Modal, Paper, Stack, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconChevronRight } from "@tabler/icons-react";

import { useExpenses } from "features/expense/api/use-expenses";
import { useActiveGroup } from "features/group";

interface DebtDetailProps {
  name: string;
  amount: string;
  payerName?: string;
  debtorName?: string;
}

function DebtDetail({ name, amount, payerName, debtorName }: DebtDetailProps) {
  if (!debtorName || !payerName) return null;

  return (
    <Paper p="sm" withBorder>
      <Text lineClamp={1}>{name}</Text>
      <Group>
        <Text size="sm" color="dimmed">
          {debtorName}
        </Text>
        <IconChevronRight />
        <Text size="sm" color="dimmed">
          {amount} zł
        </Text>
        <IconChevronRight />
        <Text size="sm" color="dimmed">
          {payerName}
        </Text>
      </Group>
    </Paper>
  );
}

type DebtDetailsProps =
  | {
      type: "debtor";
      id: string;
    }
  | { type: "payer"; id: string };

export function DebtDetails({ type, id }: DebtDetailsProps) {
  const [opened, { open, close }] = useDisclosure();
  const activeGroup = useActiveGroup();
  const { data: expenses } = useExpenses({
    groupId: activeGroup.id,
    debtorId: type === "debtor" ? id : undefined,
    payerId: type === "payer" ? id : undefined,
    settled: false,
  });

  return (
    <>
      <Button variant="default" onClick={open}>
        Szczegóły
      </Button>

      <Modal opened={opened} onClose={close} title="Szczegóły">
        {type === "debtor" && (
          <Stack>
            {expenses?.map((expense) => {
              const debtorDebt = expense.debts.find(
                (debt) => debt.debtorId === id
              );
              const amount = (
                Number(debtorDebt?.amount) - Number(debtorDebt?.settled)
              ).toFixed(2);
              const debtorName = expense.debts
                .find((debt) => debt.debtorId === id)
                ?.debtor.name?.split(" ")[0];
              const payerName = expense.payer.name?.split(" ")[0];

              return (
                <DebtDetail
                  key={expense.id}
                  name={expense.name}
                  amount={amount}
                  debtorName={debtorName}
                  payerName={payerName}
                />
              );
            })}
          </Stack>
        )}

        {type === "payer" &&
          expenses?.map((expense) => (
            <Stack key={expense.id}>
              {expense.debts
                .filter((debt) => debt.settled !== debt.amount)
                .map((debt) => {
                  const amount = (
                    Number(debt.amount) - Number(debt.settled)
                  ).toFixed(2);
                  const debtorName = debt.debtor.name?.split(" ")[0];
                  const payerName = expense.payer.name?.split(" ")[0];

                  return (
                    <DebtDetail
                      key={debt.id}
                      name={expense.name}
                      amount={amount}
                      debtorName={debtorName}
                      payerName={payerName}
                    />
                  );
                })}
            </Stack>
          ))}
      </Modal>
    </>
  );
}