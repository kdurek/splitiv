import {
  Button,
  Divider,
  Group,
  NativeSelect,
  NumberInput,
  Paper,
  Stack,
  Stepper,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { zodResolver } from "@mantine/form";
import { IconCircleX } from "@tabler/icons-react";
import Decimal from "decimal.js";
import { useEffect, useState } from "react";

import { useCreateExpense } from "features/expense/api/use-create-expense";
import { useActiveGroup } from "features/group";

import { ExpenseFormMethods } from "./expense-form-methods";
import {
  ExpenseFormProvider,
  expenseFormSchema,
  useExpenseForm,
} from "./expense-form.schema";

import type { ExpenseFormSchema } from "./expense-form.schema";

interface ExpenseFormProps {
  onSubmit?: () => void;
}

export function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const activeGroup = useActiveGroup();

  const { mutate: createExpense, isLoading: isLoadingCreateExpense } =
    useCreateExpense();

  const form = useExpenseForm({
    initialValues: {
      name: "",
      amount: 0,
      payer: "",
      debts: [],
    },
    validate: zodResolver(expenseFormSchema),
  });

  useEffect(() => {
    if (activeGroup.members[0]) {
      form.setFieldValue("payer", activeGroup.members[0].id);
      form.setValues({
        debts: activeGroup.members.map((member) => ({
          id: member.id,
          name: member.name ?? "Brak nazwy",
          amount: 0,
        })),
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [active, setActive] = useState(0);
  const nextStep = () =>
    setActive((current) => (current < 4 ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

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
        groupId: activeGroup.id,
        name: values.name,
        description: values.description,
        amount: values.amount,
        payerId: values.payer,
        debts: formattedDebts,
      },
      {
        onSuccess() {
          setActive(0);
          form.reset();
          if (onSubmit) {
            onSubmit();
          }
        },
      }
    );
  };

  const usedAmount = form.values.debts?.reduce(
    (prev, curr) => Decimal.add(prev, curr.amount || 0),
    new Decimal(0)
  );

  const remainingAmount = Decimal.sub(form.values.amount || 0, usedAmount || 0);

  const getUserNameByUserId = (userId: string) => {
    const user = activeGroup?.members.find((member) => member.id === userId);
    return user?.name ?? "Brak nazwy";
  };

  return (
    <ExpenseFormProvider form={form}>
      <Paper component="form" onSubmit={form.onSubmit(handleOnSubmit)}>
        <Stepper
          active={active}
          onStepClick={setActive}
          allowNextStepsSelect={false}
        >
          <Stepper.Step
            color={form.errors.name || form.errors.description ? "red" : "blue"}
            completedIcon={
              (form.errors.name || form.errors.description) && <IconCircleX />
            }
          >
            <Title
              order={3}
              placeholder="Wprowadź czego dotyczy wydatek"
              align="center"
            >
              Nazwa wydatku
            </Title>
            <TextInput
              mt="xs"
              placeholder="Wprowadź nazwę"
              size="md"
              {...form.getInputProps("name")}
            />
            <Title mt="md" order={3} align="center">
              Opcjonalny opis
            </Title>
            <Textarea
              size="md"
              mt="xs"
              placeholder="Wprowadź szczegóły (opcjonalne)"
              {...form.getInputProps("description")}
            />
          </Stepper.Step>

          <Stepper.Step
            color={form.errors.amount ? "red" : "blue"}
            completedIcon={form.errors.amount && <IconCircleX />}
          >
            <Title order={3} align="center">
              Kwota wydatku
            </Title>
            <NumberInput
              decimalSeparator=","
              maw={150}
              min={0}
              mt="xs"
              mx="auto"
              precision={2}
              size="md"
              step={0.01}
              onClick={(event) => event.currentTarget.select()}
              {...form.getInputProps("amount")}
            />
          </Stepper.Step>

          <Stepper.Step
            color={form.errors.payer ? "red" : "blue"}
            completedIcon={form.errors.payer && <IconCircleX />}
          >
            <Title order={3} align="center">
              Kto zapłacił za wydatek?
            </Title>
            <NativeSelect
              mt="xs"
              size="md"
              data={activeGroup.members.map((user) => ({
                value: user.id,
                label: user.name ?? "Brak nazwy",
              }))}
              {...form.getInputProps("payer")}
            />
          </Stepper.Step>

          <Stepper.Step>
            <Title order={3} align="center">
              Kto uczestniczył w wydatku?
            </Title>
            <Stack mt="md">
              {form.values.debts.map((debt, index) => (
                <Group key={debt.id} noWrap position="apart">
                  <Text>{debt.name}</Text>
                  <NumberInput
                    decimalSeparator=","
                    min={0}
                    maw={150}
                    precision={2}
                    step={0.01}
                    size="md"
                    onClick={(event) => event.currentTarget.select()}
                    {...form.getInputProps(`debts.${index}.amount`)}
                  />
                </Group>
              ))}
            </Stack>

            {remainingAmount.equals(0) && (
              <Text color="teal" align="center" mt="md" weight={700}>
                Przydzielono poprawnie
              </Text>
            )}
            {remainingAmount.lessThan(0) && (
              <Text color="red" align="center" mt="md" weight={700}>
                {`Przydzieliłeś za dużo o ${remainingAmount.toFixed(2)} zł`}
              </Text>
            )}
            {remainingAmount.greaterThan(0) && (
              <Text color="red" align="center" mt="md" weight={700}>
                {`Musisz przydzielić jeszcze ${remainingAmount.toFixed(2)} zł`}
              </Text>
            )}

            <ExpenseFormMethods />
          </Stepper.Step>

          <Stepper.Completed>
            <Title order={3} align="center">
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
              {`${(form.values?.amount || 0).toFixed(
                2
              )} zł - ${getUserNameByUserId(form.values.payer)}`}
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
              ))}
          </Stepper.Completed>
        </Stepper>

        <Divider my="md" />

        <Group position="center">
          {active > 0 && (
            <Button variant="default" onClick={prevStep}>
              Wstecz
            </Button>
          )}
          {active !== 4 && (
            <Button
              onClick={() => {
                if (active === 0) {
                  if (
                    !form.validateField("name").hasError &&
                    !form.validateField("description").hasError
                  ) {
                    nextStep();
                  }
                }

                if (active === 1) {
                  if (!form.validateField("amount").hasError) {
                    nextStep();
                  }
                }

                if (active === 2) {
                  if (!form.validateField("payer").hasError) {
                    nextStep();
                  }
                }

                if (active === 3) {
                  if (
                    !form.validateField("debts").hasError &&
                    remainingAmount.equals(0)
                  ) {
                    nextStep();
                  }
                }
              }}
            >
              Dalej
            </Button>
          )}
          {active === 4 && (
            <Button type="submit" loading={isLoadingCreateExpense}>
              Potwierdź
            </Button>
          )}
        </Group>
      </Paper>
    </ExpenseFormProvider>
  );
}
