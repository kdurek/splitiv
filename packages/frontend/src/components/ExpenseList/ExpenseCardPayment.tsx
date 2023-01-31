import {
  ActionIcon,
  Button,
  Group,
  List,
  NumberInput,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { useToggle } from "@mantine/hooks";
import { IconSquare, IconSquareCheck, IconSquareX } from "@tabler/icons-react";
import Decimal from "decimal.js";
import { useState } from "react";

import { useUpdateExpenseDebt } from "hooks/useUpdateExpenseDebt";

interface ExpenseCardPaymentProps {
  debt: {
    debtor: {
      givenName: string;
    };
    id: string;
    settled: Decimal;
    amount: Decimal;
  };
  groupId: string;
}

function ExpenseCardPayment({ debt, groupId }: ExpenseCardPaymentProps) {
  const { mutate: updateExpenseDebt } = useUpdateExpenseDebt({
    groupId,
  });
  const { colorScheme } = useMantineColorScheme();
  const [isEditing, toggleIsEditing] = useToggle();
  const [payAmount, setPayAmount] = useState(0);
  const isSettled = debt.settled === debt.amount;
  const maximumAmount = Number(debt.amount) - Number(debt.settled);

  const statusIcon = isSettled ? <IconSquareCheck /> : <IconSquare />;
  const statusColor = isSettled ? "teal" : "blue";

  const handlePay = () => {
    updateExpenseDebt(
      {
        expenseDebtId: debt.id,
        settled: payAmount + Number(debt.settled),
      },
      {
        onSuccess() {
          toggleIsEditing();
          setPayAmount(0);
        },
      }
    );
  };

  if (!debt) return null;

  return (
    <List.Item
      icon={
        <ActionIcon
          color={isEditing ? "red" : statusColor}
          variant={colorScheme === "light" ? "light" : "filled"}
          size={36}
          onClick={() => !isSettled && toggleIsEditing()}
        >
          {isEditing ? <IconSquareX /> : statusIcon}
        </ActionIcon>
      }
    >
      {isEditing ? (
        <Group>
          <ActionIcon
            color="teal"
            variant={colorScheme === "light" ? "light" : "filled"}
            size={36}
            onClick={() => handlePay()}
          >
            <IconSquareCheck />
          </ActionIcon>
          <NumberInput
            decimalSeparator=","
            min={0}
            max={maximumAmount}
            precision={2}
            step={0.01}
            value={payAmount}
            onChange={(v: number) => setPayAmount(v)}
            sx={{
              flex: 1,
            }}
          />
          <Button onClick={() => setPayAmount(maximumAmount)}>MAX</Button>
        </Group>
      ) : (
        <Text>
          {isSettled
            ? `${debt.debtor.givenName} - oddane`
            : `${debt.debtor.givenName} - ${maximumAmount.toFixed(
                2
              )} zł do oddania`}
        </Text>
      )}
    </List.Item>
  );
}

export default ExpenseCardPayment;
