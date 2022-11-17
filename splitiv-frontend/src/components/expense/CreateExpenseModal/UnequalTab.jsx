import {
  FormLabel,
  HStack,
  Heading,
  InputGroup,
  InputLeftAddon,
  NumberInput,
  NumberInputField,
  Stack,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";

function UnequalTab() {
  const { register, control, watch } = useFormContext();
  const amountWatch = watch("amount");
  const unequalWatch = watch("unequal");
  const usedAmount = parseFloat(
    unequalWatch.reduce((prev, curr) => prev + parseFloat(curr.owed || 0), 0)
  ).toFixed(2);
  const remainingAmount = (amountWatch - usedAmount).toFixed(2);

  const { fields } = useFieldArray({
    control,
    name: "unequal",
    keyName: "fieldId",
  });

  return (
    <Stack>
      <FormLabel htmlFor="unequal">Podział na dokładne kwoty</FormLabel>
      {fields.map((field, index) => (
        <HStack key={field.id}>
          <Text w="full">{field.name}</Text>
          <InputGroup>
            <InputLeftAddon pointerEvents="none">zł</InputLeftAddon>
            <NumberInput precision={2} step={0.01}>
              <NumberInputField
                {...register(`unequal.${index}.owed`, {
                  setValueAs: (v) => (v ? parseFloat(v).toFixed(2) : ""),
                  validate: () => usedAmount === amountWatch,
                })}
                placeholder="0.00"
                borderLeftRadius={0}
              />
            </NumberInput>
          </InputGroup>
        </HStack>
      ))}
      <Stack spacing={0} alignItems="end">
        <Heading size="md">{`${usedAmount} zł`}</Heading>
        <Text>{`${remainingAmount} zł do podziału`}</Text>
      </Stack>
    </Stack>
  );
}

export default UnequalTab;
