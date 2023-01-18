import { PLN } from "@dinero.js/currencies";
import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { allocate, toDecimal } from "dinero.js";

import ExpenseForm from "components/ExpenseForm";
import { ExpenseFormValues } from "components/ExpenseForm/ExpenseFormSchema";
import { useUpdateExpense } from "hooks/useUpdateExpense";
import { dineroFromString } from "utils/dinero";
import { GetExpensesByGroup, GetGroupById } from "utils/trpc";

interface UpdateExpenseModalProps {
  group: GetGroupById;
  expense: GetExpensesByGroup[number];
}

function UpdateExpenseModal({ group, expense }: UpdateExpenseModalProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const { mutate: updateExpense } = useUpdateExpense();

  if (!group) return null;

  const expensePayer = expense.users.find((user) => parseFloat(user.paid) > 0);

  const singleDefaults = {
    ower: "",
  };

  const equalDefaults = group.members.map((member) => ({
    id: member.id,
    name: member.name,
    check: false,
  }));

  const unequalDefaults = group.members.map((member) => ({
    id: member.id,
    name: member.name,
    owed: 0,
  }));

  const ratioDefaults = group.members.map((member) => ({
    id: member.id,
    name: member.name,
    ratio: 0,
  }));

  if (!expensePayer) return null;

  const defaultValues = {
    name: expense.name,
    amount: parseFloat(expense.amount),
    method: "single",
    payer: expensePayer.userId,
    single: singleDefaults,
    equal: equalDefaults,
    unequal: unequalDefaults,
    ratio: ratioDefaults,
  };

  const onSubmit = (values: ExpenseFormValues) => {
    const { name, payer, method, single, equal, unequal, ratio } = values;
    const amount = values.amount.toFixed(2);
    const dineroAmount = dineroFromString({
      amount,
      currency: PLN,
      scale: 2,
    });

    if (method === "single") {
      const users = [
        {
          paid: amount,
          owed: "0.00",
          userId: payer,
        },
        {
          paid: "0.00",
          owed: amount,
          userId: single.ower,
        },
      ];

      updateExpense({
        groupId: group.id,
        expenseId: expense.id,
        name,
        amount,
        users,
      });
    }

    if (method === "equal") {
      const filteredUsers = equal.filter(
        (user) => user.check || payer === user.id
      );
      const usersToAllocate = filteredUsers.map((user) => user.check).length;
      const allocated = allocate(
        dineroAmount,
        new Array(usersToAllocate).fill(1)
      );
      const users = filteredUsers.map((user, index) => {
        const isPayer = payer === user.id;

        return {
          paid: isPayer ? amount : "0.00",
          owed: toDecimal(allocated[index]) || "0.00",
          userId: user.id,
        };
      });

      updateExpense({
        groupId: group.id,
        expenseId: expense.id,
        name,
        amount,
        users,
      });
    }

    if (method === "unequal") {
      const users = unequal
        .filter((user) => user.owed > 0 || payer === user.id)
        .map((user) => {
          const isPayer = payer === user.id;

          return {
            paid: isPayer ? amount : "0.00",
            owed: user.owed.toFixed(2) || "0.00",
            userId: user.id,
          };
        });

      updateExpense({
        groupId: group.id,
        expenseId: expense.id,
        name,
        amount,
        users,
      });
    }

    if (method === "ratio") {
      const filteredUsers = ratio.filter(
        (user) => user.ratio > 0 || payer === user.id
      );
      const userRatios = filteredUsers.map((user) => user.ratio);
      const allocated = allocate(dineroAmount, userRatios);
      const users = filteredUsers.map((user, index) => {
        const isPayer = payer === user.id;

        return {
          paid: isPayer ? amount : "0.00",
          owed: toDecimal(allocated[index]) || "0.00",
          userId: user.id,
        };
      });

      updateExpense({
        groupId: group.id,
        expenseId: expense.id,
        name,
        amount,
        users,
      });
    }
  };

  return (
    <>
      <Button variant="default" onClick={open}>
        Edytuj płatność
      </Button>

      <Modal opened={opened} onClose={close} title="Edytowanie wydatku">
        <ExpenseForm
          group={group}
          defaultValues={defaultValues}
          onSubmit={onSubmit}
          afterSubmit={close}
          submitButtonText="Edytuj"
        />
      </Modal>
    </>
  );
}

export default UpdateExpenseModal;
