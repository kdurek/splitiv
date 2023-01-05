import { Checkbox, Group, Stack, Text } from "@mantine/core";
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

function EqualTab() {
  const { register, control, watch } = useFormContext<EqualTabFormValues>();
  const equalWatch = watch("equal");

  const { fields } = useFieldArray({
    control,
    name: "equal",
    keyName: "fieldId",
  });

  const usersIdToSplit = equalWatch
    ?.filter((ele) => ele.check)
    ?.map((ele) => ele.id);

  return (
    <Stack>
      <Text>Podział na równe kwoty</Text>
      {fields.map((field, index) => (
        <Group key={field.id} grow>
          <Checkbox
            {...register(`equal.${index}.check`, {
              validate: () => usersIdToSplit.length > 1,
            })}
            label={field.name}
          />
        </Group>
      ))}
    </Stack>
  );
}

export default EqualTab;
