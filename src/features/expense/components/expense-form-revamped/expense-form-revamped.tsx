import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Divider,
  Group,
  Modal,
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
import { useDisclosure } from "@mantine/hooks";
import { IconCircleX } from "@tabler/icons-react";
import Decimal from "decimal.js";
import { useState } from "react";
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
} from "react-hook-form";

import { useCreateExpense } from "features/expense/api/use-create-expense";
import { useActiveGroup, useGroup } from "features/group";

import { ExpenseFormRevampedMethods } from "./expense-form-revamped-methods";
import { ExpenseFormSchemaRevamped } from "./expense-form-revamped.schema";

import type { ExpenseFormValuesRevamped } from "./expense-form-revamped.schema";

export function ExpenseFormRevamped() {
  const [opened, { open, close }] = useDisclosure(false);
  const { activeGroupId } = useActiveGroup();
  const {
    data: group,
    isLoading: isLoadingGroup,
    isError: isErrorGroup,
  } = useGroup(activeGroupId);
  const { mutate: createExpense, isLoading: isLoadingCreateExpense } =
    useCreateExpense();

  const methods = useForm<ExpenseFormValuesRevamped>({
    defaultValues: {
      debts: group?.members.map((member) => ({
        id: member.id,
        name: member.name ?? "Brak nazwy",
        amount: 0,
      })),
    },
    resolver: zodResolver(ExpenseFormSchemaRevamped),
  });
  const {
    handleSubmit,
    watch,
    control,
    register,
    trigger,
    reset,
    formState: { errors },
  } = methods;

  const { fields: debts } = useFieldArray({
    control,
    name: "debts",
    keyName: "fieldId",
  });

  const liveFields = watch();

  const usedAmount = liveFields.debts?.reduce(
    (prev, curr) => Decimal.add(prev, curr.amount || 0),
    new Decimal(0)
  );

  const remainingAmount = Decimal.sub(liveFields.amount || 0, usedAmount || 0);

  const [active, setActive] = useState(0);
  const nextStep = () =>
    setActive((current) => (current < 4 ? current + 1 : current));
  const prevStep = () =>
    setActive((current) => (current > 0 ? current - 1 : current));

  const handleOnSubmit = (values: ExpenseFormValuesRevamped) => {
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
        groupId: activeGroupId,
        name: values.name,
        description: values.description || undefined,
        amount: values.amount,
        payerId: values.payer,
        debts: formattedDebts,
      },
      {
        onSuccess() {
          setActive(0);
          reset();
          close();
        },
      }
    );
  };

  const getUserNameByUserId = (userId: string) => {
    const user = group?.members.find((member) => member.id === userId);
    return user?.name ?? "...";
  };

  if (isLoadingGroup) return null;
  if (isErrorGroup) return null;

  return (
    <>
      <Button variant="default" onClick={open}>
        Dodaj wydatek nowym sposobem
      </Button>

      <Modal
        opened={opened}
        fullScreen
        onClose={close}
        title="Dodawanie wydatku"
      >
        <FormProvider {...methods}>
          <Paper>
            <Stepper
              active={active}
              onStepClick={setActive}
              allowNextStepsSelect={false}
            >
              <Stepper.Step
                color={
                  (errors.name?.message || errors.description?.message) && "red"
                }
                completedIcon={
                  (errors.name?.message || errors.description?.message) && (
                    <IconCircleX />
                  )
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
                  {...register("name")}
                  mt="xs"
                  placeholder="Wprowadź nazwę"
                  size="md"
                  error={errors.name?.message}
                />
                <Title mt="md" order={3} align="center">
                  Opcjonalny opis
                </Title>
                <Textarea
                  {...register("description")}
                  size="md"
                  mt="xs"
                  placeholder="Wprowadź szczegóły (opcjonalne)"
                  error={errors.description?.message}
                />
              </Stepper.Step>

              <Stepper.Step
                color={errors.amount?.message && "red"}
                completedIcon={errors.amount?.message && <IconCircleX />}
              >
                <Title order={3} align="center">
                  Kwota wydatku
                </Title>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <NumberInput
                      {...field}
                      decimalSeparator=","
                      error={errors.amount?.message}
                      maw={150}
                      min={0}
                      mt="xs"
                      mx="auto"
                      precision={2}
                      size="md"
                      step={0.01}
                    />
                  )}
                />
              </Stepper.Step>

              <Stepper.Step
                color={errors.payer?.message && "red"}
                completedIcon={errors.payer?.message && <IconCircleX />}
              >
                <Title order={3} align="center">
                  Kto zapłacił za wydatek?
                </Title>
                <NativeSelect
                  {...register("payer")}
                  defaultValue={undefined}
                  mt="xs"
                  size="md"
                  error={errors.payer?.message}
                  data={[
                    { value: "", label: "" },
                    ...group.members.map((user) => {
                      return {
                        value: user.id,
                        label: user.name ?? "Brak nazwy",
                      };
                    }),
                  ]}
                />
              </Stepper.Step>

              <Stepper.Step>
                <Title order={3} align="center">
                  Kto uczestniczył w wydatku?
                </Title>
                <Stack mt="md">
                  {debts.map((fieldV, index) => (
                    <Group key={fieldV.id} noWrap position="apart">
                      <Text>{fieldV.name}</Text>
                      <Controller
                        name={`debts.${index}.amount`}
                        control={control}
                        render={({ field }) => (
                          <NumberInput
                            {...field}
                            decimalSeparator=","
                            min={0}
                            maw={150}
                            precision={2}
                            step={0.01}
                            size="md"
                          />
                        )}
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
                    {`Musisz przydzielić jeszcze ${remainingAmount.toFixed(
                      2
                    )} zł`}
                  </Text>
                )}

                {errors.debts && (
                  <Text color="red" align="center" mt="md" size="xs">
                    {errors.debts?.message}
                  </Text>
                )}

                <ExpenseFormRevampedMethods />
              </Stepper.Step>

              <Stepper.Completed>
                <Title order={3} align="center">
                  Podsumowanie
                </Title>

                <Title order={4}>Nazwa</Title>
                <Text>{liveFields.name}</Text>

                {liveFields.description && (
                  <>
                    <Title mt="xs" order={4}>
                      Opis
                    </Title>
                    <Text>{liveFields.description}</Text>
                  </>
                )}

                <Title mt="xs" order={4}>
                  Zapłacił
                </Title>
                <Text>
                  {`${(liveFields?.amount || 0).toFixed(
                    2
                  )} zł - ${getUserNameByUserId(liveFields.payer)}`}
                </Text>

                <Title mt="xs" order={4}>
                  Podział
                </Title>
                {liveFields?.debts
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
              <Button variant="default" onClick={active > 0 ? prevStep : close}>
                {active > 0 ? "Wstecz" : "Anuluj"}
              </Button>
              {active !== 4 && (
                <Button
                  onClick={async () => {
                    if (active === 0) {
                      await trigger(["name", "description"]);
                      if (
                        !errors.name?.message &&
                        !errors.description?.message
                      ) {
                        nextStep();
                      }
                    }
                    if (active === 1) {
                      await trigger("amount");
                      if (!errors.amount?.message) {
                        nextStep();
                      }
                    }
                    if (active === 2) {
                      await trigger("payer");
                      if (!errors.payer?.message) {
                        nextStep();
                      }
                    }
                    if (active === 3) {
                      await trigger("debts");
                      if (!errors.debts?.message && remainingAmount.equals(0)) {
                        nextStep();
                      }
                    }
                  }}
                >
                  Dalej
                </Button>
              )}
              {active === 4 && (
                <Button
                  onClick={handleSubmit(handleOnSubmit)}
                  loading={isLoadingCreateExpense}
                >
                  Potwierdź
                </Button>
              )}
            </Group>
          </Paper>
        </FormProvider>
      </Modal>
    </>
  );
}
