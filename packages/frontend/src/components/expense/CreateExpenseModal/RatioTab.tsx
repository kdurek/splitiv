import { Group, NumberInput, Stack, Text } from "@mantine/core";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

interface RatioTabFormValues {
  amount: number;
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
  const { control, watch } = useFormContext<RatioTabFormValues>();
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
      <Text>Podział według współczynnika</Text>
      {fields.map((fieldV, index) => (
        <Group key={fieldV.id} grow position="apart">
          <Text>{fieldV.name}</Text>
          <Controller
            name={`ratio.${index}.ratio`}
            control={control}
            rules={{
              validate: () => usersIdToSplit.length > 0,
            }}
            render={({ field }) => (
              <NumberInput
                {...field}
                decimalSeparator=","
                defaultValue={0}
                min={0}
              />
            )}
          />
        </Group>
      ))}
    </Stack>
  );
}

export default RatioTab;
