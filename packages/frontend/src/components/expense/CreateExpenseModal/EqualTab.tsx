import { Checkbox, Group, Stack, Text } from "@mantine/core";
import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

interface EqualTabFormValues {
  amount: number;
  equal: {
    id: string;
    check: boolean;
    paid: string;
    owed: string;
    userId: string;
    name: string;
  }[];
}

const getBalancedSplit = (amount = 0, users: string[] = []) => {
  const breakIntoParts = (num: number, parts: number) =>
    [...Array(parts)].map((_, i) => {
      // @ts-ignore
      // eslint-disable-next-line no-bitwise
      return 0 | (num / parts + (i < num % parts));
    });

  const parts = [...Array(users.length)].map(() =>
    Math.floor(amount / users.length)
  );

  const restParts = breakIntoParts(
    Math.round(Math.fround(amount % users.length) * 100),
    users.length
  );

  const final: { [key: string]: string } = {};
  parts.forEach((part, index) => {
    if (users[index]) {
      final[users[index]] = (part + restParts[index] / 100 || 0).toFixed(2);
    }
  });

  return final;
};

function EqualTab() {
  const { register, setValue, control, watch } =
    useFormContext<EqualTabFormValues>();
  const amountWatch = watch("amount");
  const equalWatch = watch("equal");

  const usersIdToSplit = equalWatch
    ?.filter((ele) => ele.check)
    ?.map((ele) => ele.id);
  const usersAmountOwed = getBalancedSplit(amountWatch, usersIdToSplit);

  const { fields } = useFieldArray({
    control,
    name: "equal",
    keyName: "fieldId",
  });

  useEffect(() => {
    equalWatch?.forEach((field, index) => {
      setValue(`equal.${index}.owed`, usersAmountOwed[field.id]);
    });
  }, [equalWatch, setValue]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Stack>
      <Text>Podział na równe kwoty</Text>
      {fields.map((field, index) => (
        <Group key={field.id} grow position="apart">
          <Checkbox
            {...register(`equal.${index}.check`, {
              validate: () => usersIdToSplit.length > 0,
            })}
            label={field.name}
          />
          <Text align="end">{`${usersAmountOwed[field.id] || "0.00"} zł`}</Text>
        </Group>
      ))}
    </Stack>
  );
}

export default EqualTab;
