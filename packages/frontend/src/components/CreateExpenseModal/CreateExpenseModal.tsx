import { PLN } from "@dinero.js/currencies";
import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { allocate, toDecimal } from "dinero.js";
import { SubmitHandler } from "react-hook-form";

import { useCreateExpense } from "hooks/useCreateExpense";
import { dineroFromString } from "utils/dinero";
import { GetGroupById } from "utils/trpc";

import ExpenseForm from "../ExpenseForm";
import { ExpenseFormValues } from "../ExpenseForm/ExpenseFormSchema";

interface CreateExpenseModalProps {
  group: GetGroupById;
}

function CreateExpenseModal({ group }: CreateExpenseModalProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const { mutate: createExpense } = useCreateExpense();

  if (!group) return null;

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

  const defaultValues = {
    name: "",
    amount: 0,
    method: "equal",
    payer: "",
    equal: equalDefaults,
    unequal: unequalDefaults,
    ratio: ratioDefaults,
  };

  const onSubmit: SubmitHandler<ExpenseFormValues> = (values) => {
    const { name, payer, method, equal, unequal, ratio } = values;
    const amount = values.amount.toFixed(2);
    const dineroAmount = dineroFromString({
      amount,
      currency: PLN,
      scale: 2,
    });

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

      createExpense({ groupId: group.id, name, amount, users });
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

      createExpense({ groupId: group.id, name, amount, users });
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

      createExpense({ groupId: group.id, name, amount, users });
    }
  };

  return (
    <>
      <Button variant="default" onClick={open}>
        Dodaj wydatek
      </Button>

      {group && (
        <Modal opened={opened} onClose={close} title="Dodawanie wydatku">
          <ExpenseForm
            group={group}
            defaultValues={defaultValues}
            onSubmit={onSubmit}
            afterSubmit={close}
            submitButtonText="Dodaj"
          />
        </Modal>
      )}
    </>
  );
}

export default CreateExpenseModal;
