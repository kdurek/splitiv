import { PLN } from "@dinero.js/currencies";
import {
  Button,
  Checkbox,
  Collapse,
  Divider,
  Group,
  NumberInput,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { allocate, toUnit } from "dinero.js";
import { useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { useGroup } from "hooks/useGroup";
import { useActiveGroup } from "providers/ActiveGroupProvider";
import { dineroFromString } from "server/utils/dineroFromString";

import type { ExpenseFormValuesRevamped } from "./ExpenseFormSchemaRevamped";
import type { Dinero } from "dinero.js";

function ExpenseFormRevampedMethods() {
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

  const [equalSplit, setEqual] = useState<string[]>([]);
  const [ratioSplit, setRatio] = useState<{ [key: string]: number }>({});

  const [isEditing, { toggle: toggleIsEditing, close: closeIsEditing }] =
    useDisclosure(false);

  const [method, setMethod] = useState<"equal" | "ratio" | "">("");

  const liveFields = watch();

  const divideByRatio = () => {
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
            <Checkbox.Group value={equalSplit} onChange={setEqual}>
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
                setEqual([]);
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
                <NumberInput
                  defaultValue={0}
                  min={0}
                  max={9}
                  maw={80}
                  onChange={(ratio: number) =>
                    setRatio((prevState) => ({
                      ...prevState,
                      [debt.id]: ratio,
                    }))
                  }
                  step={1}
                />
              </Group>
            ))}

            <Button
              onClick={() => {
                divideByRatio();
                closeIsEditing();
                setEqual([]);
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

export default ExpenseFormRevampedMethods;