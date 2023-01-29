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
    amount: 0,
  }));

  const ratioDefaults = group.members.map((member) => ({
    id: member.id,
    name: member.name,
    ratio: 0,
  }));

  const defaultValues = {
    name: expense.name,
    amount: parseFloat(expense.amount),
    method: "single",
    payer: expense.payerId,
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
      const debts = [
        {
          amount,
          debtorId: single.ower,
        },
      ];

      updateExpense({
        expenseId: expense.id,
        groupId: group.id,
        name,
        payerId: payer,
        amount,
        debts,
      });
    }

    if (method === "equal") {
      const filteredDebtors = equal.filter(
        (debt) => debt.check || payer === debt.id
      );
      const debtorsToAllocate = filteredDebtors.map(
        (debt) => debt.check
      ).length;
      const allocated = allocate(
        dineroAmount,
        new Array(debtorsToAllocate).fill(1)
      );
      const debts = filteredDebtors.map((user, index) => {
        const isPayer = payer === user.id;

        return {
          amount: toDecimal(allocated[index]) || "0.00",
          debtorId: user.id,
          settled: isPayer,
        };
      });

      updateExpense({
        expenseId: expense.id,
        groupId: group.id,
        name,
        payerId: payer,
        amount,
        debts,
      });
    }

    if (method === "unequal") {
      const debts = unequal
        .filter((debt) => debt.amount > 0 || payer === debt.id)
        .map((debt) => {
          const isPayer = payer === debt.id;

          return {
            amount: debt.amount.toFixed(2) || "0.00",
            debtorId: debt.id,
            settled: isPayer,
          };
        });

      updateExpense({
        expenseId: expense.id,
        groupId: group.id,
        name,
        payerId: payer,
        amount,
        debts,
      });
    }

    if (method === "ratio") {
      const filteredDebtors = ratio.filter(
        (debt) => debt.ratio > 0 || payer === debt.id
      );
      const userRatios = filteredDebtors.map((debt) => debt.ratio);
      const allocated = allocate(dineroAmount, userRatios);
      const debts = filteredDebtors.map((debt, index) => {
        const isPayer = payer === debt.id;

        return {
          amount: toDecimal(allocated[index]) || "0.00",
          debtorId: debt.id,
          settled: isPayer,
        };
      });

      updateExpense({
        expenseId: expense.id,
        groupId: group.id,
        name,
        payerId: payer,
        amount,
        debts,
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
