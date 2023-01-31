import { PLN } from "@dinero.js/currencies";
import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { allocate, dinero, toDecimal } from "dinero.js";

import ExpenseForm from "components/ExpenseForm";
import { ExpenseFormValues } from "components/ExpenseForm/ExpenseFormSchema";
import { useCreateExpense } from "hooks/useCreateExpense";
import { GetGroupById } from "utils/trpc";

interface CreateExpenseModalProps {
  group: GetGroupById;
}

function CreateExpenseModal({ group }: CreateExpenseModalProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const { mutate: createExpense } = useCreateExpense();

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
    name: "",
    amount: 0,
    method: "single",
    payer: "",
    single: singleDefaults,
    equal: equalDefaults,
    unequal: unequalDefaults,
    ratio: ratioDefaults,
  };

  const onSubmit = (values: ExpenseFormValues) => {
    const { name, amount, payer, method, single, equal, unequal, ratio } =
      values;
    const dineroAmount = dinero({
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

      createExpense({
        groupId: group.id,
        name,
        amount,
        payerId: payer,
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
      const debts = filteredDebtors.map((debt, index) => {
        const isPayer = payer === debt.id;
        const debtAmount = Number(toDecimal(allocated[index]));

        return {
          settled: isPayer ? debtAmount : 0,
          amount: debtAmount,
          debtorId: debt.id,
        };
      });

      createExpense({
        groupId: group.id,
        name,
        amount,
        payerId: payer,
        debts,
      });
    }

    if (method === "unequal") {
      const debts = unequal
        .filter((debt) => debt.amount > 0 || payer === debt.id)
        .map((debt) => {
          const isPayer = payer === debt.id;

          return {
            settled: isPayer ? amount : 0,
            amount: debt.amount,
            debtorId: debt.id,
          };
        });

      createExpense({
        groupId: group.id,
        name,
        amount,
        payerId: payer,
        debts,
      });
    }

    if (method === "ratio") {
      const filteredDebtors = ratio.filter(
        (debt) => debt.ratio > 0 || payer === debt.id
      );
      const debtorRatios = filteredDebtors.map((debt) => debt.ratio);
      const allocated = allocate(dineroAmount, debtorRatios);
      const debts = filteredDebtors.map((debt, index) => {
        const isPayer = payer === debt.id;
        const debtAmount = Number(toDecimal(allocated[index]));

        return {
          settled: isPayer ? debtAmount : 0,
          amount: debtAmount,
          debtorId: debt.id,
        };
      });

      createExpense({
        groupId: group.id,
        name,
        amount,
        payerId: payer,
        debts,
      });
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
