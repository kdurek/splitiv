import {
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  NumberInput,
  NumberInputField,
  Select,
  Stack,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import FormModal from "components/FormModal";
import { useCreateExpense } from "hooks/useCreateExpense";
import { GetGroupById } from "utils/trpc";

interface CreatePaymentFormValues {
  name: string;
  amount: string;
  payer: string;
  ower: string;
}

interface CreatePaymentModalProps {
  group: GetGroupById;
}

function CreatePaymentModal({ group }: CreatePaymentModalProps) {
  const methods = useForm<CreatePaymentFormValues>({
    defaultValues: { name: "Płatność" },
  });

  const { mutate: createExpense } = useCreateExpense();

  const { register, getValues, setValue } = methods;

  useEffect(() => {
    const firstDebtFound = group?.debts?.[0];
    if (firstDebtFound) {
      setValue("ower", firstDebtFound.fromId);
      setValue("payer", firstDebtFound.toId);
      setValue("amount", firstDebtFound.amount);
    }
  }, [group?.debts, setValue]);

  const onSubmit: SubmitHandler<CreatePaymentFormValues> = (values) => {
    if (!group?.id) {
      throw new Error("groupId not defined");
    }

    const { name, amount, payer, ower } = values;
    const type = "payment";
    const users = [
      {
        paid: amount,
        owed: "0.00",
        userId: ower,
      },
      {
        paid: "0.00",
        owed: amount,
        userId: payer,
      },
    ];

    createExpense({ groupId: group.id, name, amount, type, users });
  };

  return (
    <FormModal<CreatePaymentFormValues>
      modalButtonText="Dodaj płatność"
      headerText="Dodawanie płatności"
      cancelButtonText="Anuluj"
      submitButtonText="Dodaj"
      methods={methods}
      onSubmit={onSubmit}
    >
      <FormControl>
        <Stack>
          <Box>
            <FormLabel htmlFor="name">Nazwa</FormLabel>
            <Input
              {...register("name", {
                required: "Pole jest wymagane",
                minLength: {
                  value: 3,
                  message: "Minimum length should be 3",
                },
              })}
              placeholder="Wprowadź nazwę"
            />
          </Box>
          <Box>
            <FormLabel htmlFor="amount">Kwota</FormLabel>
            <InputGroup>
              <InputLeftAddon pointerEvents="none">zł</InputLeftAddon>
              <NumberInput precision={2} step={0.01} w="100%">
                <NumberInputField
                  {...register("amount", {
                    required: "Pole jest wymagane",
                    setValueAs: (v: string) =>
                      v ? parseFloat(v).toFixed(2) : "",
                  })}
                  placeholder="0.00"
                  borderLeftRadius={0}
                />
              </NumberInput>
            </InputGroup>
          </Box>
          <Box>
            <FormLabel htmlFor="ower">Od</FormLabel>
            <Select
              {...register("ower", {
                required: "Pole jest wymagane",
                validate: (v) => getValues("payer") !== v,
              })}
            >
              {group?.members.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </Box>
          <Box>
            <FormLabel htmlFor="payer">Dla</FormLabel>
            <Select
              {...register("payer", {
                required: "Pole jest wymagane",
                validate: (v) => getValues("ower") !== v,
              })}
            >
              {group?.members.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </Select>
          </Box>
        </Stack>
      </FormControl>
    </FormModal>
  );
}

export default CreatePaymentModal;
