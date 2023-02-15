import { PLN } from "@dinero.js/currencies";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Group, Paper } from "@mantine/core";
import { allocate, toUnit } from "dinero.js";
import { FormProvider, useForm } from "react-hook-form";

import { useCreateExpense } from "hooks/useCreateExpense";
import { dineroFromString } from "server/utils/dineroFromString";

import ExpenseFormDetails from "./ExpenseFormDetails";
import ExpenseFormMethodTabs from "./ExpenseFormMethodTabs";
import { ExpenseFormSchema } from "./ExpenseFormSchema";

import type { ExpenseFormValues } from "./ExpenseFormSchema";
import type { Dinero } from "dinero.js";
import type { GetGroupById } from "utils/api";

interface ExpenseFormProps {
  group: GetGroupById;
  expenseId?: string;
  defaultValues: ExpenseFormValues;
  onSuccess?: () => void;
}

function ExpenseForm({
  group,
  expenseId,
  defaultValues,
  onSuccess,
}: ExpenseFormProps) {
  const methods = useForm<ExpenseFormValues>({
    defaultValues,
    resolver: zodResolver(ExpenseFormSchema),
  });
  const { mutate: createExpense, isLoading: isLoadingCreateExpense } =
    useCreateExpense();

  const handleCreateExpense = (values: ExpenseFormValues) => {
    const {
      name,
      description,
      amount,
      payer,
      method,
      single,
      equal,
      unequal,
      ratio,
    } = values;
    const dineroAmount = dineroFromString({
      amount: amount.toFixed(2),
      currency: PLN,
      scale: 2,
    });

    let debts: {
      settled: number;
      amount: number;
      debtorId: string;
    }[] = [];

    if (method === "single") {
      debts = [
        {
          settled: 0,
          amount,
          debtorId: single.ower,
        },
      ];
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
      debts = filteredDebtors.map((debt, index) => {
        const isPayer = payer === debt.id;
        const debtAmount = toUnit(allocated[index] as Dinero<number>);
        return {
          settled: isPayer ? debtAmount : 0,
          amount: debtAmount,
          debtorId: debt.id,
        };
      });
    }

    if (method === "unequal") {
      debts = unequal
        .filter((debt) => debt.amount > 0 || payer === debt.id)
        .map((debt) => {
          const isPayer = payer === debt.id;

          return {
            settled: isPayer ? debt.amount : 0,
            amount: debt.amount,
            debtorId: debt.id,
          };
        });
    }

    if (method === "ratio") {
      const filteredDebtors = ratio.filter(
        (debt) => debt.ratio > 0 || payer === debt.id
      );
      const debtorRatios = filteredDebtors.map((debt) => debt.ratio);
      const allocated = allocate(dineroAmount, debtorRatios);
      debts = filteredDebtors.map((debt, index) => {
        const isPayer = payer === debt.id;
        const debtAmount = toUnit(allocated[index] as Dinero<number>);

        return {
          settled: isPayer ? debtAmount : 0,
          amount: debtAmount,
          debtorId: debt.id,
        };
      });
    }

    createExpense(
      {
        groupId: group.id,
        name,
        description: description || undefined,
        amount,
        payerId: payer,
        debts,
      },
      {
        onSuccess() {
          if (onSuccess) {
            onSuccess();
          }
          methods.reset();
        },
      }
    );
  };

  const handleUpdateExpense = (values: ExpenseFormValues) => {
    // TODO Implement expense update
    console.log(values);
  };

  const handleOnSubmit = (values: ExpenseFormValues) =>
    expenseId ? handleUpdateExpense(values) : handleCreateExpense(values);

  return (
    <FormProvider {...methods}>
      <Paper component="form" onSubmit={methods.handleSubmit(handleOnSubmit)}>
        <ExpenseFormDetails group={group} />
        <ExpenseFormMethodTabs group={group} />
        <Group mt={24} position="right">
          <Button loading={isLoadingCreateExpense} type="submit">
            {expenseId ? "Zapisz" : "Dodaj"}
          </Button>
        </Group>
      </Paper>
    </FormProvider>
  );
}

export default ExpenseForm;
