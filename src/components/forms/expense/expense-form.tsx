"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconLoader2 } from "@tabler/icons-react";
import Decimal from "decimal.js";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { Button } from "components/ui/button";
import { CurrencyInput } from "components/ui/currency-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "components/ui/form";
import { Input } from "components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { Textarea } from "components/ui/textarea";
import { useCreateExpense } from "hooks/use-create-expense";

import {
  type ExpenseFormSchema,
  expenseFormSchema,
} from "./expense-form.schema";

import type { GetGroupById } from "utils/api";

interface ExpenseFormProps {
  group: GetGroupById;
}

export function ExpenseForm({ group }: ExpenseFormProps) {
  const router = useRouter();
  const { mutate: createExpense, isLoading: isLoadingCreateExpense } =
    useCreateExpense();

  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      amount: 0,
      payer: "",
      debts: group.members.map((member) => ({
        id: member.id,
        name: member.name || "",
        amount: 0,
      })),
    },
    resolver: zodResolver(expenseFormSchema),
  });

  const usedAmount = form
    .getValues("debts")
    .reduce(
      (prev, curr) => Decimal.add(prev, curr.amount || 0),
      new Decimal(0)
    );

  const remainingAmount = Decimal.sub(
    form.getValues("amount") || 0,
    usedAmount || 0
  );

  // const getUserNameByUserId = (userId: string) => {
  //   const user = group.members.find((member) => member.id === userId);
  //   return user?.name ?? "Brak nazwy";
  // };

  const handleOnSubmit = (values: ExpenseFormSchema) => {
    const formattedDebts = values.debts
      .filter(
        (debt) =>
          debt.amount !== 0 || (values.payer === debt.id && debt.amount !== 0)
      )
      .map((debt) => {
        const isPayer = values.payer === debt.id;

        return {
          settled: isPayer ? debt.amount : 0,
          amount: values.amount ? debt.amount : 0,
          debtorId: debt.id,
        };
      });

    createExpense(
      {
        name: values.name,
        description: values.description,
        amount: values.amount,
        payerId: values.payer,
        debts: formattedDebts,
      },
      {
        onSuccess() {
          router.push("/");
        },
      }
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleOnSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Czego dotyczy wydatek?</FormLabel>
              <FormControl>
                <Input placeholder="Wprowadź nazwę" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opcjonalny opis</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Wprowadź szczegóły (opcjonalne)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Całkowita kwota wydatku</FormLabel>
              <FormControl>
                <CurrencyInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kto zapłacił za wydatek?</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz osobę" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {group.members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-4">
          <FormLabel>Kto uczestniczył w wydatku?</FormLabel>
          {form.getValues("debts").map((debt, index) => (
            <FormField
              key={debt.id}
              control={form.control}
              name={`debts.${index}.amount`}
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  {debt.name}
                  <FormControl>
                    <CurrencyInput className="w-32" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        {remainingAmount.equals(0) && (
          <div className="text-teal-500 text-end text-bold">
            Przydzielono poprawnie
          </div>
        )}
        {remainingAmount.lessThan(0) && (
          <div className="text-red-500 text-end text-bold">
            {`Przydzieliłeś za dużo o ${remainingAmount.toFixed(2)} zł`}
          </div>
        )}
        {remainingAmount.greaterThan(0) && (
          <div className="text-red-500 text-end text-bold">
            {`Musisz przydzielić jeszcze ${remainingAmount.toFixed(2)} zł`}
          </div>
        )}

        {/* <ExpenseFormMethods /> */}

        {/* <Title order={3} align="center">
          Podsumowanie
        </Title>

        <Title order={4}>Nazwa</Title>
        <Text>{form.values.name}</Text>

        {form.values.description && (
          <>
            <Title mt="xs" order={4}>
              Opis
            </Title>
            <Text>{form.values.description}</Text>
          </>
        )}

        <Title mt="xs" order={4}>
          Zapłacił
        </Title>
        <Text>
          {`${(form.values?.amount || 0).toFixed(2)} zł - ${getUserNameByUserId(
            form.values.payer
          )}`}
        </Text>

        <Title mt="xs" order={4}>
          Podział
        </Title>
        {form.values?.debts
          ?.filter((debt) => debt.amount)
          .map((debt) => (
            <Text key={debt.id}>{`${debt.amount.toFixed(2)} zł - ${
              debt.name
            }`}</Text>
          ))} */}

        <div className="flex justify-end gap-4 mt-6">
          <Button>
            {isLoadingCreateExpense && (
              <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Potwierdź
          </Button>
        </div>
      </form>
    </Form>
  );
}
