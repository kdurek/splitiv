import { PLN } from "@dinero.js/currencies";
import {
  Button,
  Checkbox,
  Collapse,
  Divider,
  Group,
  NativeSelect,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { allocate, toUnit } from "dinero.js";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { useActiveGroup, useGroup } from "features/group";
import { dineroFromString } from "server/utils/dineroFromString";

import type { ExpenseFormValuesRevamped } from "./expense-form-revamped.schema";
import type { Dinero } from "dinero.js";

export function ExpenseFormRevampedMethods() {
  const { activeGroupId } = useActiveGroup();
  const {
    data: group,
    isLoading: isLoadingGroup,
    isError: isErrorGroup,
  } = useGroup(activeGroupId);

  const methods = useFormContext<ExpenseFormValuesRevamped>();
  const { watch, control, setValue, trigger } = methods;

  const { fields: debts } = useFieldArray({
    control,
    name: "debts",
    keyName: "fieldId",
  });

  const [equalSplit, setEqualSplit] = useState<string[]>([]);
  const [ratioSplit, setRatioSplit] = useState<{ [key: string]: number }>({});

  const [isEditing, { toggle: toggleIsEditing, close: closeIsEditing }] =
    useDisclosure(false);

  const [method, setMethod] = useState<"equal" | "ratio" | "">("");

  const liveFields = watch();

  const divideByRatio = () => {
    if (
      Object.values(ratioSplit).every((v) => v === 0) ||
      Object.keys(ratioSplit).length === 0
    ) {
      liveFields.debts.forEach((_, index) => {
        setValue(`debts.${index}.amount`, 0);
      });
      return;
    }

    const dineroAmount = dineroFromString({
      amount: liveFields.amount.toFixed(2),
      currency: PLN,
      scale: 2,
    });

    const debtors = Object.entries(ratioSplit).map((debt) => {
      return { id: debt[0], ratio: debt[1] };
    });

    const debtorRatios = debtors.map((debt) => debt.ratio);
    const allocated = allocate(dineroAmount, debtorRatios);
    const allocatedRatio = allocated.map((a, index) => {
      return {
        id: debtors[index]?.id,
        amount: toUnit(a),
      };
    });

    const newDebts = liveFields.debts.map((debtor) => {
      const amountToPay =
        allocatedRatio.find((user) => user.id === debtor.id)?.amount || 0;

      return {
        name: debtor.name,
        id: debtor.id,
        amount: amountToPay,
      };
    });

    newDebts.forEach((debt, index) => {
      setValue(`debts.${index}.amount`, debt.amount);
    });
    trigger("debts");
  };

  const divideEqually = async () => {
    if (equalSplit.length === 0) {
      liveFields.debts.forEach((_, index) => {
        setValue(`debts.${index}.amount`, 0);
      });
      return;
    }

    const dineroAmount = dineroFromString({
      amount: liveFields.amount.toFixed(2),
      currency: PLN,
      scale: 2,
    });

    const usersToAllocate = liveFields.debts.filter((user) =>
      equalSplit.includes(user.id)
    );

    const allocated = allocate(
      dineroAmount,
      new Array(usersToAllocate.length).fill(1)
    );

    const allocatedUsers = usersToAllocate.map((user, index) => ({
      id: user.id,
      amount: equalSplit.includes(user.id)
        ? toUnit(allocated[index] as Dinero<number>)
        : 0,
    }));

    if (!group) return;

    const newDebts = liveFields.debts.map((debtor) => {
      const isInArray = usersToAllocate.find((user) => user.id === debtor.id);
      const amountToPay =
        allocatedUsers.find((user) => user.id === debtor.id)?.amount || 0;

      return {
        name: debtor.name,
        id: debtor.id,
        amount: isInArray ? amountToPay : 0,
      };
    });

    newDebts.forEach((debt, index) => {
      setValue(`debts.${index}.amount`, debt.amount);
    });
    trigger("debts");
  };

  if (isLoadingGroup) return null;
  if (isErrorGroup) return null;

  return (
    <Stack>
      <Divider mt="md" />
      <Button variant="default" onClick={toggleIsEditing}>
        Podziel
      </Button>
      <Collapse in={isEditing}>
        <Group grow>
          <Button variant="default" onClick={() => setMethod("equal")}>
            Równo
          </Button>
          <Button variant="default" onClick={() => setMethod("ratio")}>
            Współczynnik
          </Button>
        </Group>

        <Collapse in={method === "equal"}>
          <Stack mt="md">
            <Checkbox.Group value={equalSplit} onChange={setEqualSplit}>
              <Stack spacing="xs">
                {debts.map((debt) => (
                  <Checkbox
                    key={debt.fieldId}
                    value={debt.id}
                    label={debt.name}
                  />
                ))}
              </Stack>
            </Checkbox.Group>
            <Button
              onClick={() => {
                divideEqually();
                closeIsEditing();
                setMethod("");
              }}
            >
              Potwierdź
            </Button>
          </Stack>
        </Collapse>

        <Collapse in={method === "ratio"}>
          <Stack mt="md">
            {debts.map((debt) => (
              <Group key={debt.id} noWrap position="apart">
                <Text>{debt.name}</Text>
                <NativeSelect
                  size="md"
                  data={[...Array(10).keys()].map((num) => ({
                    value: num.toString(),
                    label: num.toString(),
                  }))}
                  value={ratioSplit[debt.id]}
                  onChange={(event) => {
                    const num = Number(event.currentTarget?.value);
                    setRatioSplit((prevState) => ({
                      ...prevState,
                      [debt.id]: num,
                    }));
                  }}
                />
              </Group>
            ))}

            <Button
              onClick={() => {
                divideByRatio();
                closeIsEditing();
                setMethod("");
              }}
            >
              Potwierdź
            </Button>
          </Stack>
        </Collapse>
      </Collapse>
    </Stack>
  );
}
