import { Checkbox, FormLabel, HStack, Stack, Text } from "@chakra-ui/react";
import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

const getBalancedSplit = (amount = 0, users = []) => {
  const breakIntoParts = (num, parts) =>
    [...Array(parts)].map((_, i) => {
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

  const final = {};
  parts.forEach((part, index) => {
    if (users[index]) {
      final[Number(users[index])] = (
        part + restParts[index] / 100 || 0
      ).toFixed(2);
    }
  });

  return final;
};

function EqualTab() {
  const { register, setValue, control, watch } = useFormContext();
  const amountWatch = parseFloat(watch("amount"));
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
  }, [amountWatch, usersIdToSplit?.length]);

  return (
    <Stack>
      <FormLabel htmlFor="equal">Podział na równe kwoty</FormLabel>
      {fields.map((field, index) => (
        <HStack h="40px" key={field.id}>
          <Checkbox
            {...register(`equal.${index}.check`, {
              validate: () => usersIdToSplit.length > 0,
            })}
            w="full"
          >
            {field.name}
          </Checkbox>
          <Text whiteSpace="nowrap">{`${
            usersAmountOwed[field.id] || "0.00"
          } zł`}</Text>
        </HStack>
      ))}
    </Stack>
  );
}

export default EqualTab;
