import {
  FormLabel,
  HStack,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useFieldArray, useFormContext } from "react-hook-form";

interface RatioTabFormValues {
  amount: string;
  ratio: {
    id: string;
    ratio: number;
    paid: string;
    owed: string;
    userId: string;
    name: string;
  }[];
}

function RatioTab() {
  const { register, control, watch } = useFormContext<RatioTabFormValues>();
  const ratioWatch = watch("ratio");

  const usersIdToSplit = ratioWatch
    ?.filter((ele) => ele.ratio > 0)
    ?.map((ele) => ele.id);

  const { fields } = useFieldArray({
    control,
    name: "ratio",
    keyName: "fieldId",
  });

  return (
    <Stack>
      <FormLabel htmlFor="ratio">Podział według współczynnika</FormLabel>
      {fields.map((field, index) => (
        <HStack key={field.id}>
          <Text w="full" whiteSpace="nowrap">
            {field.name}
          </Text>
          <NumberInput w="100%" defaultValue={0} min={0}>
            <NumberInputField
              {...register(`ratio.${index}.ratio`, {
                validate: () => usersIdToSplit.length > 0,
              })}
            />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </HStack>
      ))}
    </Stack>
  );
}

export default RatioTab;
